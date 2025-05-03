/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import path from "node:path";

import { dialog } from "electron";
import fs from "fs";
import Client, { File, Server, Share, SourceTargetFileNames, UploadFilesCommand } from "nextcloud-node-client";

export async function nextcloudUpload(_, username: string, appToken: string, serverUrl: string, uploadDir: string) {
    try {
        serverUrl = serverUrl.trim();
        if (!serverUrl.endsWith("/"))
            serverUrl += "/";

        if (!uploadDir.endsWith("/"))
            uploadDir += "/";
        if (!uploadDir.startsWith("/"))
            uploadDir = "/" + uploadDir;

        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ["openFile"]
        });
        if (canceled)
            return { success: false, message: "canceled file picker" };

        const filePath: string = filePaths[0];
        const server: Server = new Server(
            {
                basicAuth:
                {
                    password: appToken,
                    username: username,
                },
                url: serverUrl
            }
        );
        const client = new Client(server);

        // ensure directory exists
        await client.createFolder(uploadDir);

        // upload file
        const uploadPath: string = `${uploadDir}${path.basename(filePath)}`;
        const files: SourceTargetFileNames[] = [
            {
                sourceFileName: filePath,
                targetFileName: uploadPath
            }
        ];
        const uc: UploadFilesCommand = new UploadFilesCommand(client, { files });
        await uc.execute();
        const file: File | null = await client.getFile(uploadPath);
        if (!file) return { success: false, message: "couldn't get the uploaded file erm" };
        // create share
        const share: Share = await client.createShare({ fileSystemElement: file });

        // const shareUrl = `${serverUrl}/ocs/v2.php/apps/files_sharing/api/v1/shares`;
        // const credentials = Buffer.from(`${username}:${appToken}`).toString("base64");
        // const response = await fetch(shareUrl,
        //    {
        //        method: "POST",
        //        headers: {
        //            "Authorization": `Basic ${credentials}`,
        //            "Content-Type": "application/x-www-form-urlencoded",
        //            "OCS-APIRequest": "true",
        //            "Accept": "application/json",
        //            "User-Agent": "discord",
        //        },
        //        body: JSON.stringify({
        //            path: uploadPath,
        //            shareType: 3,
        //            expireDate: "",
        //            attributes: "[]"
        //        })
        //    }
        // );
        // if (!response.ok) {
        //    throw new Error(`HTTP error status: ${response.status}`);
        // }
        // const responseData = await response.json();
        // if (responseData.ocs?.meta?.status !== "ok") {
        //    throw new Error(`API Error: ${responseData.ocs?.meta?.message || "Unknown error"}`);
        // }

        const extension = path.extname(filePath).toLowerCase();

        let resultURL = "";
        const fileStat = fs.statSync(filePath);
        const fileSizeMB = fileStat.size / 1024 / 1024;
        if (fileSizeMB >= 50 || [".mp4", ".mp3", ".wav", ".ogg", ".flac", ".m4a"]
            .includes(extension)) {
            const isImage = [".png", ".gif", ".gifv", ".jpg", ".jpeg", ".webp", ".avif"]
                .includes(extension);
            resultURL = isImage
                ? `${serverUrl}s/${share.token}/preview?${extension}`
                : `${serverUrl}s/${share.token}`;
        }
        else {
            resultURL = `${serverUrl}apps/sharingpath/${username}/${uploadPath}`;
        }

        return {
            success: true,
            url: `[${path.basename(filePath)}](${encodeURI(resultURL)})`
        };
    } catch (error) {
        return { success: false, message: error };
    }
}
