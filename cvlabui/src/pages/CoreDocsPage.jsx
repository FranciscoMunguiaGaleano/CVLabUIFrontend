import { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const README_URL =
  "https://raw.githubusercontent.com/FranciscoMunguiaGaleano/CVLabCore/main/README.md";

function CoreDocsPage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(README_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load README");
        return res.text();
      })
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: "auto",
        lineHeight: 1.7,
        "& img": {
          maxWidth: "100%",
          height: "auto"
        }
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}   // ⭐ THIS IS THE KEY
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
}

export default CoreDocsPage;
