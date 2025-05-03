/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { OptionType } from "@utils/types";

export const settings = definePluginSettings({
    serverUrl: {
        type: OptionType.STRING,
        description: "The base URL of your NextCloud instance (e.g., https://cloud.example.com)",
        placeholder: "https://cloud.example.com"
    },
    username: {
        type: OptionType.STRING,
        description: "Your NextCloud username"
    },
    appToken: {
        type: OptionType.STRING,
        description: "Your NextCloud password or app token"
    },
    uploadDir: {
        type: OptionType.STRING,
        description: "Directory to store uploaded files (relative to your NextCloud root)",
        placeholder: "/Discord/"
    }
});
