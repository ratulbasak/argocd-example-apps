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

    // Destructure application and tree from props
    const { application, tree } = props;

    // Safely access application name
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
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            <div style={{
                width: "60px",
                flexGrow: "1",
                color: "#495763",
                textAlign: "center",
              }}
            >
              Resources {metrics.totalResources || 0}
            </div>
            <div style={{
                width: "60px",
                flexGrow: "1",
                color: "#495763",
                textAlign: "center",
              }}
            >
              Pods {metrics.totalPods || 0}
            </div>
            <div style={{
                width: "60px",
                flexGrow: "1",
                color: "#495763",
                textAlign: "center",
              }}
            >
              Out-of-Sync {metrics.outOfSyncCount || 0}
            </div>
            {/* <ResourceCard title="Resources" value={metrics.totalResources || 0} />
            <ResourceCard title="Pods" value={metrics.totalPods || 0} />
            <ResourceCard title="Out-of-Sync" value={metrics.outOfSyncCount || 0} /> */}
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