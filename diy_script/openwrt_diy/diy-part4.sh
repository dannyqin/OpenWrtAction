#!/bin/bash
# 该脚本会在make defconfig之后执行

# =================================================================
# 函数: install_rustdesk_server
# 描述: 根据 OpenWrt 核心架构自动拉取最新版 RustDesk Server
#       自动无视官方解压包内部命名规则，并完美支持扩展架构。
# =================================================================
install_rustdesk_server() {
    echo "========== 开始集成最新版 RustDesk Server =========="

    # 1. 检查是否存在 .config 文件
    if [ ! -f "./.config" ]; then
        echo "错误：未找到 .config 文件，请确保在 OpenWrt 源码根目录且已执行 make defconfig！"
        return 1
    fi

    # 2. 设置临时目录与目标目录
    local FILES_DIR="./files"
    local TMP_DIR="/tmp/rustdesk_install"
    
    mkdir -p "${FILES_DIR}/usr/bin"
    rm -rf "${TMP_DIR}"
    mkdir -p "${TMP_DIR}"

    # 3. 核心精髓：直接从 .config 提取最底层的架构名称
    # 结果会是 x86_64, aarch64, arm, i386, mips 等
    local OPENWRT_ARCH
    OPENWRT_ARCH=$(grep "^CONFIG_ARCH=" ./.config | cut -d '"' -f 2)
    
    if [ -z "$OPENWRT_ARCH" ]; then
        echo "错误：无法从 .config 中读取 CONFIG_ARCH 变量！"
        return 1
    fi
    echo "检测到当前 OpenWrt 核心架构为: $OPENWRT_ARCH"

    # 4. 根据底层架构精准映射 RustDesk 下载后缀
    local ARCH_KEYWORD=""
    case "$OPENWRT_ARCH" in
        "x86_64")
            ARCH_KEYWORD="linux-amd64.zip"
            ;;
        "aarch64")
            ARCH_KEYWORD="linux-arm64v8.zip"
            ;;
        "arm")
            ARCH_KEYWORD="linux-armv7.zip"
            ;;
        "i386")
            ARCH_KEYWORD="linux-i386.zip"
            ;;
        *)
            # 如果你编译了 MT7621 (mipsel) 或 AR9331 (mips)，RustDesk 是没包的
            echo "警告：RustDesk Server 官方暂不支持该架构 ($OPENWRT_ARCH)！"
            echo "跳过 RustDesk Server 的集成，不中断编译流程。"
            return 0 
            ;;
    esac

    # 5. 获取最新 Release 下载链接
    echo "正在查询 RustDesk Server 最新版本..."
    local API_URL="https://api.github.com/repos/rustdesk/rustdesk-server/releases/latest"
    local DOWNLOAD_URLS
    DOWNLOAD_URLS=$(curl -s "$API_URL" | grep "browser_download_url" | cut -d '"' -f 4)

    # 6. 匹配出当前架构的专属下载链接
    local TARGET_URL
    TARGET_URL=$(echo "$DOWNLOAD_URLS" | grep "$ARCH_KEYWORD")

    if [ -z "$TARGET_URL" ]; then
        echo "错误：未找到架构 [$ARCH_KEYWORD] 的下载链接，请检查网络或 GitHub API 限制！"
        return 1 
    fi
    echo "匹配到下载链接: $TARGET_URL"

    # 7. 下载并解压到临时目录
    wget -qO "${TMP_DIR}/rustdesk-server.zip" "$TARGET_URL"
    unzip -q "${TMP_DIR}/rustdesk-server.zip" -d "${TMP_DIR}"

    # 8. 彻底动态化：使用 find 查找文件，官方怎么乱给内部文件夹起名都不会报错
    local HBBS_PATH
    local HBBR_PATH
    HBBS_PATH=$(find "${TMP_DIR}" -type f -name "hbbs" | head -n 1)
    HBBR_PATH=$(find "${TMP_DIR}" -type f -name "hbbr" | head -n 1)

    if [ -z "$HBBS_PATH" ] || [ -z "$HBBR_PATH" ]; then
        echo "错误：在解压目录中未能找到 hbbs 或 hbbr 文件！"
        ls -laR "${TMP_DIR}" # 打印目录结构方便排错
        return 1
    fi

    echo "成功提取文件:"
    echo "  -> $HBBS_PATH"
    echo "  -> $HBBR_PATH"

    # 9. 拷贝并赋权
    cp -f "$HBBS_PATH" "${FILES_DIR}/usr/bin/"
    cp -f "$HBBR_PATH" "${FILES_DIR}/usr/bin/"

    chmod +x "${FILES_DIR}/usr/bin/hbbs"
    chmod +x "${FILES_DIR}/usr/bin/hbbr"

    # 10. 清除痕迹
    rm -rf "${TMP_DIR}"

    echo "========== RustDesk Server ($OPENWRT_ARCH) 注入固件完成 =========="
}