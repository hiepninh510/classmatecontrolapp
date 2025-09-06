import { Layout } from "antd";

export function AppFooter(){
    return(
        <>
        <Layout.Footer style={{ textAlign: 'center' }}>
            Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Layout.Footer>
        </>
    )
}