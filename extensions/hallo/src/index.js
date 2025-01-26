import * as React from "react";
import { useEffect, useState } from "react";


export const Extension = (props) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const backendServiceUrl = '/extensions/hallo/api/todos';
  console.log("backendServiceUrl: ", backendServiceUrl);
  console.log("props: ", props);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(backendServiceUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("data: ", result);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h3>Data from Backend Service:</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export const component = Extension;


((window) => {
  window.extensionsAPI.registerResourceExtension(
    component,
    '*',
    'Deployment',
    'TODO'
  );

  window.extensionsAPI.registerResourceExtension(
    component,
    '*',
    'StatefulSet',
    'TODO'
  );

  window.extensionsAPI.registerResourceExtension(
    component,
    '*',
    'DaemonSet',
    'TODO'
  );

  window.extensionsAPI.registerResourceExtension(
    component,
    '',
    'Pod',
    'TODO'
  );
})(window);