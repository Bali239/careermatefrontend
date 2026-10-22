"use client";

import { PropsWithChildren, useState } from "react";
import { ConfigProvider } from "antd";
import { Provider as ReduxProvider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { store } from "@/store";
import { createQueryClient } from "@/lib/query-client";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Toaster } from "sonner";

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
          <AuthProvider>{children}</AuthProvider>
        </ConfigProvider>
      </ReduxProvider>
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  );
}
