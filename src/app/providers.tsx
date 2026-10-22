"use client";

import { PropsWithChildren, useState } from "react";
import { ConfigProvider } from "antd";
import { Provider as ReduxProvider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { store } from "@/store";
import { createQueryClient } from "@/lib/query-client";

export default function Providers({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    createQueryClient,
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ReduxProvider store={store}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#6958d6",
              borderRadius: 12,
              fontFamily: "Arial, Helvetica, sans-serif",
            },
          }}
        >
          {children}
        </ConfigProvider>
      </ReduxProvider>
    </QueryClientProvider>
  );
}
