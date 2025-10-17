/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react"
import type { Rooms } from "../../models/locationInterface"
import { adminAPI } from "../AdminServices"
import { useOpenNotification } from "../../hooks/Notification/notification"
import { Button, Card, Col, Row, Tooltip } from "antd"
import Title from "antd/es/typography/Title"
import { LockOutlined, StarFilled, UnlockOutlined } from "@ant-design/icons"
import { AddRoomModal } from "../modal/AddRoom"

export function ListRoom(){
    const [rooms,setRooms] = useState<Rooms[]>([])
    const {openNotification,contextHolder} = useOpenNotification();
    const [isOpenModal,setIsOpenModal] = useState<boolean>(false);

    const fetchRooms = async()=>{
        try {
            const res = await adminAPI.getAllRoom();
            if(res.data.success){
                setRooms(res.data.rooms);
            }  else openNotification("warning","Hiển thị dữ liệu thất bại")
        } catch (error) {
            console.log(error);
            openNotification("error","Có lỗi")
        }
    }

    const groupedRooms = rooms.reduce<Record<string,Rooms[]>>((acc,room)=>{
        if(!acc[room.areas]) acc[room.areas] = [];
        acc[room.areas].push(room);
        return acc;
    },{}as Record<string,Rooms[]>);

      const toggleActive = async (roomId: string) => {
    try {
      const updatedRooms = rooms.map((r) =>
        r.id === roomId ? { ...r, active: !r.active } : r
      );
      setRooms(updatedRooms);
      const res = await adminAPI.updateRoomStatus(roomId, updatedRooms.find(r => r.id === roomId)?.active);
      if(res.data.success){
          openNotification("success", "Cập nhật trạng thái thành công");
      } else openNotification("warning", "Cập nhật thất bại");
    } catch (error) {
      console.log(error);
      openNotification("error", "Cập nhật thất bại");
    }
  };

    const handleAddRoomSuccess = (newRoom: Rooms) => {
        setRooms(prev => [...prev, newRoom]);
    };

    useEffect(()=>{
        fetchRooms();
    },[])
    return(
        <>
            {contextHolder}
            <div style={{ padding: "20px" }}>
            {/* Header: Khu + Button */}
            <div
                style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                }}
            >
                <Title level={3}>Danh sách phòng</Title>
                <Button type="primary" onClick={() => setIsOpenModal(true)}>
                Thêm phòng mới
                </Button>
            </div>

            {/* Danh sách rooms theo khu */}
            {Object.entries(groupedRooms).map(([area, areaRooms]) => (
                <div key={area} style={{ marginBottom: "40px" }}>
                <Title level={4}>
                    <strong>Khu: </strong>
                    {area}
                </Title>
                <Row gutter={[16, 16]}>
                    {areaRooms.map((room) => (
                    <Col key={room.id} xs={24} sm={12} md={8} lg={6} xl={4}>
                        <Card
                        hoverable
                        style={{
                            width: "100%",
                            opacity: room.active ? 1 : 0.6,
                            border: room.isVIP ? "2px solid gold" : undefined,
                            position: "relative",
                            boxShadow: room.isVIP ? "0 0 10px rgba(255,215,0,0.7)" : undefined,
                        }}
                        >
                        {/* Icon VIP */}
                        {room.isVIP && (
                            <StarFilled
                            style={{
                                color: "gold",
                                position: "absolute",
                                top: 8,
                                right: 8,
                                fontSize: 20,
                            }}
                            />
                        )}

                        {/* Overlay Tạm ngừng */}
                        {!room.active && (
                            <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                backgroundColor: "rgba(255,0,0,0.2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                                fontSize: 16,
                                color: "red",
                                zIndex: 1,
                            }}
                            >
                            Tạm ngừng
                            </div>
                        )}

                        {/* <Card.Meta title={room.name} description={`ID: ${room.id}`} /> */}

                        <Card.Meta title={room.name} />

                        {/* ID trên 1 dòng, ellipsis */}
                        <div
                            style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            marginTop: 4,
                            }}
                            title={room.id} // tooltip khi hover
                        >
                            ID: {room.id}
                        </div>


                        {/* Icon khóa */}
                        <Tooltip title={room.active ? "Đang mở" : "Tạm ngừng"}>
                            {room.active ? (
                            <UnlockOutlined
                                onClick={() => toggleActive(room.id)}
                                style={{
                                fontSize: 20,
                                position: "absolute",
                                bottom: 8,
                                right: 8,
                                cursor: "pointer",
                                zIndex: 2,
                                }}
                            />
                            ) : (
                            <LockOutlined
                                onClick={() => toggleActive(room.id)}
                                style={{
                                fontSize: 20,
                                position: "absolute",
                                bottom: 8,
                                right: 8,
                                cursor: "pointer",
                                zIndex: 2,
                                }}
                            />
                            )}
                        </Tooltip>
                        </Card>
                    </Col>
                    ))}
                </Row>
                </div>
            ))}
            </div>

            <AddRoomModal
                open={isOpenModal}
                onClose={()=>setIsOpenModal(false)}
                onAddSuccess={handleAddRoomSuccess}
            
            />

        </>
    )
}