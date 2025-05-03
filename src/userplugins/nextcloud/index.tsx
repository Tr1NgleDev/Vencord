/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { NavContextMenuPatchCallback } from "@api/ContextMenu";
import { PlusIcon } from "@components/Icons";
import { insertTextIntoChatInputBox } from "@utils/discord";
import definePlugin, { PluginNative } from "@utils/types";
import { findByPropsLazy } from "@webpack";
import { Menu, PermissionsBits, PermissionStore } from "@webpack/common";

import { settings } from "./settings";
const OptionClasses = findByPropsLazy("optionName", "optionIcon", "optionLabel");

const Native = VencordNative.pluginHelpers.NextCloud as PluginNative<typeof import("./native")>;

const ctxMenuPatch: NavContextMenuPatchCallback = (children, props) => {
    if (props.channel.guild_id && !(PermissionStore.can(PermissionsBits.SEND_MESSAGES, props.channel) && PermissionStore.can(PermissionsBits.ATTACH_FILES, props.channel))) return;

    children.push(
        <Menu.MenuItem
            id="vc-send-nextcloud-file"
            label={
                <div className={OptionClasses.optionLabel}>
                    <PlusIcon className={OptionClasses.optionIcon} height={24} width={24} />
                    <div className={OptionClasses.optionName}>Upload a File via NextCloud</div>
                </div>
            }
            action={async () => {
                if (!settings.store.serverUrl || !settings.store.appToken || !settings.store.username) {
                    return;
                }

                if (!settings.store.uploadDir)
                    settings.store.uploadDir = "";

                try {
                    const result = await Native.nextcloudUpload(
                        settings.store.username,
                        settings.store.appToken,
                        settings.store.serverUrl,
                        settings.store.uploadDir
                    );
                    if (result.success)
                        handleSuccess(result.url);
                    else
                        console.error(`Upload failed: ${result.message}`);
                } catch (error) {
                    console.error(`Upload failed: ${error}`);
                }
            }}
        />
    );
};

function handleSuccess(url) {
    const messageInput = document.querySelector('[data-slate-editor="true"]');
    if (messageInput) {
        insertTextIntoChatInputBox(url + " ");
    }
    console.log("File uploaded to NextCloud!");
}

export default definePlugin({
    name: "NextCloud",
    description: "NextCloud Integration",
    authors: [{ name: "Tr1NgleDev", id: 450597912334958593n }],
    settings,
    contextMenus: {
        "channel-attach": ctxMenuPatch
    },
});

