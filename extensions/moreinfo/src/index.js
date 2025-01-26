import * as React from "react";
import { useEffect, useState } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
// import ResourceCard from './Resources/Card/Card';


const ResourceCard = ({ title, value }) => {
    return (
        <Card variant="outlined" style={{ margin: '10px' }}>
            <CardContent>
                <Typography variant="h5">{title}</Typography>
                <Typography variant="body1">{value}</Typography>
            </CardContent>
        </Card>
    );
};

export const MoreInfo = ( props ) => {
    const [metrics, setMetrics] = useState({
        totalResources: 0,
        totalPods: 0,
        outOfSyncCount: 0,
    });

    // const { application, tree } = props;
    const application_name = props.application.metadata.name || "";

    console.log("appname: ", application_name);
    console.log("props: ", props);


    useEffect(() => {
        if (props) {
            const totalResources = props.application.status.resources.length;
            const totalPods = props.tree.nodes.filter(r => r.kind === 'Pod').length;
            const outOfSyncCount = props.application.status.resources.filter(r => r.status !== 'Synced').length;

            setMetrics({
                totalResources,
                totalPods,
                outOfSyncCount,
            });
        }
    }, [props]);

    console.log("more_info: ", metrics);

    return (
      // <React.Fragment>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            <ResourceCard title="Resources" value={metrics.totalResources || 0} />
            <ResourceCard title="Pods" value={metrics.totalPods || 0} />
            <ResourceCard title="Out-of-Sync" value={metrics.outOfSyncCount || 0} />
        </div>
      // </React.Fragment>
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