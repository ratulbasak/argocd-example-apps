import React, { useState, useEffect } from "react";
import { Button, Table, Select, Input, Modal, notification } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { confirm } = Modal;
const { Option } = Select;

const ArgoCDImageUpdater = ( props ) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [updateHistory, setUpdateHistory] = useState({});

    const { application, tree } = props;
    const appName = application?.metadata?.name || "";

    useEffect(() => {
        fetchImageData();
    }, []);

    const fetchImageData = async () => {
        setLoading(true);
        try {
            const resources = application.status.resources.filter(r => r.kind === "Deployment" || r.kind === "StatefulSet");
            const images = [];

            for (const resource of resources) {
                const name = resource.name;
                const namespace = resource.namespace;
                const kind = resource.kind;
                const group = kind === "Deployment" ? "apps" : "apps";
                const version = resource.version;
                const url = `/api/v1/applications/${appName}/resource?name=${name}&appNamespace=argocd&namespace=${namespace}&resourceName=${name}&version=${version}&kind=${kind}&group=${group}`;
                const response = await fetch(url);
                const result = await response.json();
                const manifest = JSON.parse(result.manifest);
                const containers = manifest.spec.template.spec.containers;

                if (containers) {
                    containers.forEach(container => {
                        const [imageUrl, imageTag] = container.image.split(":");
                        const existing = images.find((img) => img.resource === `${manifest.kind}/${manifest.metadata.name}`);
                        if (existing) {
                            existing.images.push({ imageUrl, imageTag, containerName: container.name });
                        } else {
                            images.push({
                                resource: `${manifest.kind}/${manifest.metadata.name}`,
                                images: [{ imageUrl, imageTag, containerName: container.name }],
                                selectedImage: imageUrl,
                                newTag: imageTag,
                                metadata: manifest.metadata,
                                apiVersion: manifest.apiVersion,
                                kind: manifest.kind,
                                spec: manifest.spec.template.spec,
                            });
                        }
                    })
                }
            }
            setData(images);
        } catch (error) {
            notification.error({ message: "Failed to fetch image data" });
        }
        setLoading(false);
    };

    const handleUpdate = async (record) => {
        confirm({
            title: "Confirm Update",
            icon: <ExclamationCircleOutlined />,
            content: `Update ${record.selectedImage} to tag ${record.newTag}?`,
            onOk: async () => {
                setUpdating((prev) => ({ ...prev, [record.resource]: true }));
                try {
                    const url = `/api/v1/applications/${appName}/resource?name=${record.metadata.name}&appNamespace=argocd&namespace=${record.metadata.namespace}&resourceName=${record.metadata.name}&version=${record.apiVersion.split("/").pop()}&kind=${record.kind}&group=${record.apiVersion.includes("/") ? record.apiVersion.split("/")[0] : ""}&patchType=application%2Fmerge-patch%2Bjson`;

                    const updatedSpec = JSON.parse(JSON.stringify(record.spec));
                    updatedSpec.containers = updatedSpec.containers.map((container) => {
                        if (container.image.startsWith(record.selectedImage)) {
                            container.image = `${record.selectedImage}:${record.newTag}`;
                        }
                        return container;
                    });
                    
                    const payload = JSON.stringify({ spec: { template: { spec: updatedSpec }} });
                    
                    const response = await fetch(url, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    });

                    if (!response.ok) {
                        notification.error({ message: "Failed to update image tag" });
                        throw new Error("Failed to update image tag");
                    }

                    notification.success({ message: "Image tag updated successfully" });
                    
                    setUpdateHistory((prev) => {
                        const newHistory = { ...prev };
                        if (!newHistory[record.resource]) {
                            newHistory[record.resource] = [];
                        }
                        newHistory[record.resource].unshift({ image: record.selectedImage, tag: record.newTag });
                        if (newHistory[record.resource].length > 5) {
                            newHistory[record.resource].pop();
                        }
                        return newHistory;
                    });
                    
                    await fetchImageData();
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
                <Select value={value} onChange={(val) => setData((prev) => prev.map((item) => item.resource === record.resource ? { ...item, selectedImage: val, newTag: item.images.find(img => img.imageUrl === val)?.imageTag || "" } : item))}>
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
                <div>
                    <Input value={value} onChange={(e) => setData((prev) => prev.map((item) => item.resource === record.resource ? { ...item, newTag: e.target.value } : item))} />
                    <ul>
                        {updateHistory[record.resource]?.map((update, index) => (
                            <li key={index}>{update.image}:{update.tag}</li>
                        ))}
                    </ul>
                </div>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Button type="primary" loading={updating[record.resource]} onClick={() => handleUpdate(record)}>Update</Button>
            ),
        },
    ];

    return <Table columns={columns} dataSource={data} loading={loading} rowKey="resource" />;
};

export const component = ArgoCDImageUpdater;


((window) => {
    window.extensionsAPI.registerResourceExtension(
        component,
        "argoproj.io",
        "Application",
        "moreinfo"
    );
})(window);
