import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, message } from "antd";

function ChangeInfo({ isOpen, onClose, defaultInfo, onSubmit }) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (isOpen && defaultInfo) {
      form.setFieldsValue({
        fullName: defaultInfo.fullName,
        phone: defaultInfo.phone,
        address: defaultInfo.address,
      });
    }
  }, [isOpen, defaultInfo, form]);

  const handleSubmit = async (values) => {
    try {
      await form.validateFields();
      onSubmit(values);
      onClose();
      message.success("Cập nhật thông tin thành công!");
    } catch (error) {
      message.error("Vui lòng kiểm tra lại thông tin!");
    }
  };

  return (
    <Modal
      title="Thay đổi thông tin nhận hàng"
      open={isOpen}
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="fullName"
          label="Họ và tên"
          rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
        >
          <Input placeholder="Nhập họ và tên" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Số điện thoại"
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại!" },
            { pattern: /^[0-9]{10}$/, message: "Số điện thoại không hợp lệ!" },
          ]}
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>

        <Form.Item
          name="address"
          label="Địa chỉ"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
        >
          <Input.TextArea placeholder="Nhập địa chỉ" />
        </Form.Item>

        <Form.Item className="form-buttons">
          <Button type="primary" htmlType="submit">
            Cập nhật
          </Button>
          <Button onClick={onClose} style={{ marginLeft: 8 }}>
            Hủy
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ChangeInfo;
