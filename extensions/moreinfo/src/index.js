import * as React from "react";
import { useEffect, useState } from 'react';
import ResourceCard from './Resources/Card/Card';


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

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            <ResourceCard title="Resources" value={metrics.totalResources} />
            <ResourceCard title="Pods" value={metrics.totalPods} />
            <ResourceCard title="Out-of-Sync" value={metrics.outOfSyncCount} />
            {/* <ResourceCard title="CPU Pressure" value={metrics.cpuPressure ? 'Yes' : 'No'} />
            <ResourceCard title="Memory Pressure" value={metrics.memoryPressure ? 'Yes' : 'No'} /> */}
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