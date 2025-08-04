import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Login = () => {
  return (
    <div>
      <form>
        <Input 
          label="Email" 
          type="email" 
          placeholder="Nhập email của bạn"
        />
        <Input 
          label="Mật khẩu" 
          type="password" 
          placeholder="Nhập mật khẩu"
        />
        <Button type="submit" style={{ width: '100%', marginBottom: '16px' }}>
          Đăng nhập
        </Button>
      </form>
      <p style={{ textAlign: 'center' }}>
        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
      </p>
    </div>
  );
};

export default Login;