"use client";

import Link from "next/link";
import { Avatar, Button, Dropdown, Space, Typography } from "antd";
import type { MenuProps } from "antd";
import { DownOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { useAuth } from "./AuthProvider";

export default function AuthLinks() {
  const { user, ready, signOut } = useAuth();
  if (!ready) return <div className="auth-nav-placeholder" aria-hidden="true" />;
  if (!user) return <div className="auth-nav"><Link href="/auth/login">Log in</Link><Link className="auth-nav-cta" href="/auth/signup">Get started</Link></div>;
  const items: MenuProps["items"] = [
    {
      key: "account",
      label: (
        <div className="account-menu-profile">
          <Typography.Text strong>{user.name}</Typography.Text>
          <Typography.Text type="secondary">{user.email}</Typography.Text>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    { key: "signout", icon: <LogoutOutlined />, label: "Sign out", onClick: () => void signOut(), danger: true },
  ];

  return (
    <Space size={8} className="account-actions">
      <Link className="auth-nav-cta" href="/dashboard">Dashboard</Link>
      <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
        <Button className="account-menu-trigger" type="text" aria-label="Open account menu">
          <Space size={8}>
            <Avatar src={user.avatarUrl || undefined} icon={!user.avatarUrl ? <UserOutlined /> : undefined} />
            <DownOutlined className="account-menu-chevron" />
          </Space>
        </Button>
      </Dropdown>
    </Space>
  );
}
