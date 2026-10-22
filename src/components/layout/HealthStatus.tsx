"use client";

import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Space, Tag } from "antd";
import { api } from "@/lib/axios";

type HealthResponse = {
  status: "ok";
  service: string;
  environment: string;
  timestamp: string;
};

export default function HealthStatus() {
  const healthQuery = useQuery({
    queryKey: ["api-health"],
    queryFn: async () => {
      const response = await api.get<HealthResponse>("health");
      return response.data;
    },
  });

  if (healthQuery.isPending) {
    return <Tag color="processing">Checking</Tag>;
  }

  if (healthQuery.isError) {
    return (
      <Space direction="vertical" size="small" className="w-full">
        <Tag color="error">Disconnected</Tag>
        <Alert
          type="error"
          showIcon
          message="The API could not be reached. Check the server and API URL."
          action={
            <Button size="small" onClick={() => void healthQuery.refetch()} loading={healthQuery.isFetching}>
              Retry
            </Button>
          }
        />
      </Space>
    );
  }

  return <Tag color="success">Connected</Tag>;
}
