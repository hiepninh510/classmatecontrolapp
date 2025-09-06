import { Layout, theme } from "antd";
import React from "react";
interface LayoutContentProps{
    children:React.ReactNode
}

export function AppContent({children}:LayoutContentProps){
    const {
      token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    return(
        <>
        <Layout.Content style={{ padding: 24, background: colorBgContainer, borderRadius: borderRadiusLG }}>
            {children}
        </Layout.Content> 
        </>
    )
}