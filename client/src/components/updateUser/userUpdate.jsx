import { Form, Select } from "antd";
import React from "react";
import { Button, Input, Radio, message as antdMessage } from "antd";
import { useMutation } from "@tanstack/react-query";
import { updateUser } from "../../services/userService"; 
import { useDispatch } from "react-redux"; 
import { updateUser as updateReduxUser } from "../../redux/slices/userSlice"; 

function UserUpdate() {
  const user = JSON.parse(sessionStorage.getItem("userState"))?.user || {};
  const { Option } = Select;
  const [form] = Form.useForm();
  const dispatch = useDispatch(); 

  React.useEffect(() => {
    form.setFieldsValue({
      username: user.username,
      gender: user.gender,
      email: user.email,
      phone: user.phone,
      address: user.address,
    });
  }, [user, form]);

  const updateUserMutation = useMutation({
    mutationFn: ({ id, userData }) => updateUser(id, userData), 
    onSuccess: (data) => {
      console.log("Cập nhật thông tin tài khoản thành công:", data); 
      antdMessage.success("Cập nhật thông tin tài khoản thành công.");

      const newAccessToken = data.access_token; 
      const updatedUserData = data.data; 

      const updatedUser = {
        ...user, 
        ...updatedUserData, 
        access_token: newAccessToken, 
      };

      sessionStorage.setItem(
        "userState",
        JSON.stringify({ user: updatedUser })
      );
    
      dispatch(updateReduxUser(updatedUser)); 
    },
    onError: (error) => {
      console.error(
        "Cập nhật thất bại:",
        error.response?.data || error.message
      );
      let errorMessage = "Cập nhật thất bại. Vui lòng thử lại.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === "Network Error") {
        errorMessage = "Lỗi kết nối mạng. Vui lòng kiểm tra internet.";
      }
      antdMessage.error(errorMessage); 
    },
  });

  const onFinish = (values) => {
    const { username, gender, email, phone, address } = values;
    updateUserMutation.mutate({
      id: user._id, 
      userData: { username, gender, email, phone, address },
    });
  };

  return (
    <Form
      form={form}
      name="user_update"
      onFinish={onFinish}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      layout="horizontal"
      initialValues={{
        username: user.username,
        gender: user.gender,
        email: user.email,
        phone: user.phone,
        address: user.address,
      }}
    >
      <h2>Cập nhật thông tin tài khoản</h2>
      <Form.Item
        label="Tên đăng nhập"
        name="username"
        rules={[{ required: true, message: "Tên đăng nhập là bắt buộc!" }]}
      >
        <Input placeholder="Tên đăng nhập" />
      </Form.Item>
      <Form.Item
        label="Email"
        name="email"
        rules={[{ required: true, message: "Email is required!" }]}
      >
        <Input placeholder="email" />
      </Form.Item>

      <Form.Item
        name="gender"
        label="Gender"
        rules={[{ required: true, message: "Please select gender!" }]}
      >
        <Select placeholder="select your gender">
          <Option value="male">Male</Option>
          <Option value="female">Female</Option>
          <Option value="other">Other</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Số điện thoại"
        name="phone"
        rules={[{ required: true, message: "Số điện thoại là bắt buộc" }]}
      >
        <Input placeholder="Số điện thoại" />
      </Form.Item>

      <Form.Item
        label="Địa chỉ"
        name="address"
        rules={[{ required: true, message: "Địa chỉ là bắt buộc" }]}
      >
        <Input placeholder="Địa chỉ" />
      </Form.Item>
      <Form.Item style={{display:'flex', justifyContent:'center' }} >
        <Button
          type="primary"
          htmlType="submit"
          block
          style={{ width: "auto", }} 
          loading={updateUserMutation.isPending}
        >
          Cập nhật thông tin
        </Button>
      </Form.Item>
    </Form>
  );
}

export default UserUpdate;
