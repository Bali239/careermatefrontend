'use client';

import Link from 'next/link';
import { Avatar, Button, Dropdown, Space, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { DownOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from './AuthProvider';

export default function AuthLinks() {
  const { user, ready, signOut } = useAuth();
  if (!ready) return <div className="h-9 w-[145px]" aria-hidden="true" />;
  if (!user)
    return (
      <div className="flex items-center gap-1.5 text-xs font-bold text-[#676d85] sm:gap-3">
        <Link className="px-2 py-2.5 sm:px-3" href="/auth/login">
          Log in
        </Link>
        <Link
          className="rounded-[9px] bg-[#6958d6] px-3 py-2.5 text-white shadow-[0_6px_16px_#6958d622] hover:bg-[#5949c5] sm:px-4"
          href="/auth/signup"
        >
          Get started
        </Link>
      </div>
    );
  const items: MenuProps['items'] = [
    {
      key: 'account',
      label: (
        <div className="grid max-w-[230px] gap-[3px] px-0 py-[5px] [&_.ant-typography]:overflow-hidden [&_.ant-typography]:text-ellipsis [&_.ant-typography]:whitespace-nowrap">
          <Typography.Text strong>{user.name}</Typography.Text>
          <Typography.Text type="secondary">{user.email}</Typography.Text>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'signout',
      icon: <LogoutOutlined />,
      label: 'Sign out',
      onClick: () => void signOut(),
      danger: true,
    },
  ];

  return (
    <Space size={8}>
      <Link
        className="rounded-[9px] bg-[#6958d6] px-3 py-2.5 text-xs font-bold text-white shadow-[0_6px_16px_#6958d622] hover:bg-[#5949c5] sm:px-4"
        href="/dashboard"
      >
        Dashboard
      </Link>
      <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
        <Button
          className="!h-[42px] !rounded-full !px-2 hover:!bg-[#f3f1ff]"
          type="text"
          aria-label="Open account menu"
        >
          <Space size={8}>
            <Avatar
              src={user.avatarUrl || undefined}
              icon={!user.avatarUrl ? <UserOutlined /> : undefined}
            />
            <DownOutlined className="!text-[10px] !text-[#777b90]" />
          </Space>
        </Button>
      </Dropdown>
    </Space>
  );
}
