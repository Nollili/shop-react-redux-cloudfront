import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import axios from "axios";

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File>();
  const [uploading, setUploading] = React.useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(undefined);
  };

  const uploadFile = async () => {
    if (!file) return;
    
    console.log("uploadFile to", url);
    setUploading(true);

    try {
      // Get authorization token from localStorage
      const authorizationToken = localStorage.getItem('authorization_token');
      
      if (!authorizationToken) {
        alert('Authorization token not found. Please set it in localStorage.');
        setUploading(false);
        return;
      }

      // Step 1: Get the presigned URL from our import API
      // This calls GET /import?name=filename.csv to get a signed URL
      const response = await axios({
        method: "GET",
        url,
        params: {
          name: encodeURIComponent(file.name),
        },
        headers: {
          Authorization: `Basic ${authorizationToken}`,
        },
      });
      
      console.log("File to upload: ", file.name);
      // console.log("Uploading to: ", response.data.signedUrl);
      
      // Step 2: Upload the file directly to S3 using the signed URL
      // This bypasses our API and uploads directly to S3 bucket
      const result = await fetch(response.data.signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          'Content-Type': 'text/csv',
        },
      });
      
      // console.log("Upload result: ", result);
      
      if (result.ok) {
        console.log("File uploaded successfully!");
        // Clear the file after successful upload
        setFile(undefined);
        alert("File uploaded successfully!");
      } else {
        console.error("Upload failed:", result.statusText);
        alert("Upload failed: " + result.statusText);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file: " + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        // File selection input - only shows when no file is selected
        <input type="file" accept=".csv" onChange={onFileChange} />
      ) : (
        <div>
          <p>Selected file: {file.name}</p>
          <button onClick={removeFile} disabled={uploading}>
            Remove file
          </button>
          <button onClick={uploadFile} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload file"}
          </button>
        </div>
      )}
    </Box>
  );
}
