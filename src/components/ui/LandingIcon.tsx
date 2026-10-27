'use client';

import {
  ArrowRightOutlined,
  BulbOutlined,
  FileSearchOutlined,
  SafetyCertificateOutlined,
  StarOutlined,
} from '@ant-design/icons';

const iconByName = {
  arrow: ArrowRightOutlined,
  bulb: BulbOutlined,
  fileSearch: FileSearchOutlined,
  safety: SafetyCertificateOutlined,
  star: StarOutlined,
} as const;

type LandingIconName = keyof typeof iconByName;

export default function LandingIcon({ name }: { name: LandingIconName }) {
  const Icon = iconByName[name];
  return <Icon aria-hidden="true" />;
}
