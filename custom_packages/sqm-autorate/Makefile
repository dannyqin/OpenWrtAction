include $(TOPDIR)/rules.mk

PKG_NAME:=sqm-autorate
PKG_VERSION:=0.6.1
PKG_RELEASE:=1

PKG_SOURCE_PROTO:=git
PKG_SOURCE_URL:=https://github.com/sqm-autorate/sqm-autorate.git
PKG_SOURCE_VERSION:=4eb8a6b472f8c7bfcb7584db301ee3c376f506cc
PKG_MIRROR_HASH:=skip

PKG_LICENSE:=GPL-2.0-only
PKG_LICENSE_FILES:=LICENSE
PKG_MAINTAINER:=dannyqin

include $(INCLUDE_DIR)/package.mk

define Package/sqm-autorate
  SECTION:=net
  CATEGORY:=Network
  TITLE:=Automatic SQM bandwidth adjustment
  URL:=https://github.com/sqm-autorate/sqm-autorate
  DEPENDS:=+sqm-scripts +lua +libuci-lua +lua-bit32 +luaposix +lualanes +lua-argparse +lua-vstruct +tc-full +kmod-sched-cake
  PKGARCH:=all
endef

define Package/sqm-autorate/description
 Dynamically adjusts CAKE/SQM bandwidth for variable-rate links such as LTE
 and 5G. The service is intentionally disabled by default.
endef

define Package/sqm-autorate/conffiles
/etc/config/sqm-autorate
endef

define Build/Compile
endef

define Package/sqm-autorate/install
	$(INSTALL_DIR) $(1)/usr/lib/sqm-autorate
	$(CP) $(PKG_BUILD_DIR)/lib/. $(1)/usr/lib/sqm-autorate/
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_CONF) $(PKG_BUILD_DIR)/config/sqm-autorate.config $(1)/etc/config/sqm-autorate
	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./files/sqm-autorate.init $(1)/etc/init.d/sqm-autorate
endef

$(eval $(call BuildPackage,sqm-autorate))
