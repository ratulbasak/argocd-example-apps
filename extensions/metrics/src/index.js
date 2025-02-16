import React, { useState, useEffect } from "react";
import { Button, Table, Select, Input, Modal, notification } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { confirm } = Modal;
const { Option } = Select;

const ArgoCDImageUpdater = ({ appName }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    fetchImageData();
  }, []);

  const fetchImageData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/applications/${appName}`);
      const result = await response.json();
      const images = extractImages(result);
      setData(images);
    } catch (error) {
      notification.error({ message: "Failed to fetch image data" });
    }
    setLoading(false);
  };

  const extractImages = (appData) => {
    const resources = appData?.status?.resources || [];
    const images = [];
    
    resources.forEach((res) => {
      if (res.kind === "Deployment" || res.kind === "StatefulSet") {
        res.spec?.template?.spec?.containers?.forEach((container) => {
          const [imageUrl, imageTag] = container.image.split(":");
          const existing = images.find((img) => img.resource === `${res.kind}/${res.metadata.name}`);
          if (existing) {
            existing.images.push({ imageUrl, imageTag, containerName: container.name });
          } else {
            images.push({
              resource: `${res.kind}/${res.metadata.name}`,
              images: [{ imageUrl, imageTag, containerName: container.name }],
              selectedImage: imageUrl,
              newTag: imageTag,
            });
          }
        });
      }
    });
    return images;
  };

  const handleUpdate = async (record) => {
    confirm({
      title: "Confirm Update",
      icon: <ExclamationCircleOutlined />,
      content: `Update ${record.selectedImage} to tag ${record.newTag}?`,
      onOk: async () => {
        setUpdating((prev) => ({ ...prev, [record.resource]: true }));
        try {
          await fetch(`/api/v1/applications/${appName}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              resource: record.resource,
              image: `${record.selectedImage}:${record.newTag}`,
            }),
          });
          notification.success({ message: "Image tag updated successfully" });
          fetchImageData();
        } catch (error) {
          notification.error({ message: "Failed to update image tag" });
        }
        setUpdating((prev) => ({ ...prev, [record.resource]: false }));
      },
    });
  };

  const columns = [
    { title: "Resource", dataIndex: "resource", key: "resource" },
    {
      title: "Image URL",
      dataIndex: "selectedImage",
      key: "selectedImage",
      render: (value, record) => (
        <Select
          value={value}
          onChange={(val) => setData((prev) => prev.map((item) => item.resource === record.resource ? { ...item, selectedImage: val, newTag: item.images.find(img => img.imageUrl === val)?.imageTag || "" } : item))}
        >
          {record.images.map((img) => (
            <Option key={img.imageUrl} value={img.imageUrl}>{img.imageUrl}</Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Image Tag",
      dataIndex: "newTag",
      key: "newTag",
      render: (value, record) => (
        <Input
          value={value}
          onChange={(e) => setData((prev) => prev.map((item) => item.resource === record.resource ? { ...item, newTag: e.target.value } : item))}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button type="primary" loading={updating[record.resource]} onClick={() => handleUpdate(record)}>
          Update
        </Button>
      ),
    },
  ];

  return <Table columns={columns} dataSource={data} loading={loading} rowKey="resource" />;
};

export default ArgoCDImageUpdater;


((window) => {
    window.extensionsAPI.registerResourceExtension(
        ArgoCDImageUpdater,
        "argoproj.io",
        "Application",
        "moreinfo"
    );
})(window);