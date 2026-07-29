include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-h69k-fancontrol
PKG_VERSION:=1.0.0
PKG_RELEASE:=1

PKG_MAINTAINER:=dannyqin
PKG_LICENSE:=GPL-3.0-or-later

LUCI_TITLE:=LuCI support for H69K PWM fan control
LUCI_DEPENDS:=+kmod-hwmon-pwmfan +rpcd +luci-base
LUCI_PKGARCH:=all

PKG_CONFIG_DEPENDS:=CONFIG_PACKAGE_luci-app-h69k-fancontrol

define Package/$(PKG_NAME)/conffiles
/etc/config/h69k-fancontrol
endef

include $(TOPDIR)/feeds/luci/luci.mk

define Package/$(PKG_NAME)/postinst
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || {
	/etc/init.d/h69k-fancontrol enable >/dev/null 2>&1
	/etc/init.d/h69k-fancontrol restart >/dev/null 2>&1
	rm -f /tmp/luci-indexcache
}
exit 0
endef

$(eval $(call BuildPackage,$(PKG_NAME)))
