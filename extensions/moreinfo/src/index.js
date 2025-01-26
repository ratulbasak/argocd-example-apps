import * as React from "react";
import { useEffect, useState } from 'react';
// import { Card, CardContent, Typography } from '@mui/material';

// const ResourceCard = ({ title, value }) => {
//     return (
//         <Card variant="outlined" style={{ margin: '10px' }}>
//             <CardContent>
//                 <Typography variant="h5">{title}</Typography>
//                 <Typography variant="body1">{value}</Typography>
//             </CardContent>
//         </Card>
//     );
// };

export const MoreInfo = (props) => {
    const [metrics, setMetrics] = useState({
        totalResources: 0,
        totalPods: 0,
        outOfSyncCount: 0,
    });

    const { application, tree } = props;

    const application_name = application?.metadata?.name || "";

    console.log("appname: ", application_name);
    console.log("props: ", props);

    useEffect(() => {
        if (application?.status && tree?.nodes) {
            const totalResources = application.status.resources.length;
            const totalPods = tree.nodes.filter(r => r.kind === 'Pod').length;
            const outOfSyncCount = application.status.resources.filter(r => r.status !== 'Synced').length;

            setMetrics({
                totalResources,
                totalPods,
                outOfSyncCount,
            });
        }
    }, [application, tree]);

    console.log("application: ", application);
    console.log("tree: ", tree);
    console.log("more_info: ", metrics);

    return (
      <div>
        <div title={`Resources: ${metrics.totalResources || 0}`}
            style={{
              marginTop: "2rem",
              padding: "0.2rem",
              boxShadow: "1px 1px 1px #ccd6dd",
              borderRadius: "4px",
              border: "1px solid transparent",
              backgroundColor: "#fff",
              color: "#363c4a",
              display: "flex",
            }}
        ></div>
        <div title={`Pods: ${metrics.totalPods || 0}`}
            style={{
              marginTop: "2rem",
              padding: "0.2rem",
              boxShadow: "1px 1px 1px #ccd6dd",
              borderRadius: "4px",
              border: "1px solid transparent",
              backgroundColor: "#fff",
              color: "#363c4a",
              display: "flex",
            }}
        ></div>
        <div title={`Out-of-Sync: ${metrics.outOfSyncCount || 0}`}
            style={{
              marginTop: "2rem",
              padding: "0.2rem",
              boxShadow: "1px 1px 1px #ccd6dd",
              borderRadius: "4px",
              border: "1px solid transparent",
              backgroundColor: "#fff",
              color: "#363c4a",
              display: "flex",
            }}
        ></div>
      </div>
    );
};

export const component = MoreInfo;

((window) => {
    window.extensionsAPI.registerResourceExtension(
        component,
        "argoproj.io",
        "Application",
        "moreinfo"
    );
})(window);