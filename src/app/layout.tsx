import type { Metadata } from "next";
import "./index.css";
import "@mantine/core/styles.css";
import { ColorSchemeScript, createTheme, MantineProvider } from "@mantine/core";

export const metadata: Metadata = {
  title: "Survey App",
  // TODO: change this
  description: "Still in progress.",
  robots: {
    index: false,
    follow: false,
  },
};

const theme = createTheme({
  colors: {
    brand: [
      "#fff2ea",
      "#f3e6da",
      "#e2cbb8",
      "#d1af92",
      "#c39672",
      "#bb875d",
      "#b77f52",
      "#a16d42",
      "#906139",
      "#7f522b",
    ],
  },
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme}>
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
