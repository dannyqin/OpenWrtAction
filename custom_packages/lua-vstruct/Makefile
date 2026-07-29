include $(TOPDIR)/rules.mk

PKG_NAME:=lua-vstruct
PKG_VERSION:=2.1.1
PKG_RELEASE:=1

PKG_SOURCE_PROTO:=git
PKG_SOURCE_URL:=https://github.com/ToxicFrog/vstruct.git
PKG_SOURCE_VERSION:=924d3dd63043189e4a7ef6b1b54b19208054cc0f
PKG_MIRROR_HASH:=skip

PKG_LICENSE:=MIT
PKG_LICENSE_FILES:=COPYING
PKG_MAINTAINER:=dannyqin

include $(INCLUDE_DIR)/package.mk

define Package/lua-vstruct
  SECTION:=lang
  CATEGORY:=Languages
  SUBMENU:=Lua
  TITLE:=Lua binary data manipulation library
  URL:=https://github.com/ToxicFrog/vstruct
  DEPENDS:=+lua
  PKGARCH:=all
endef

define Package/lua-vstruct/description
 Pure Lua library used by sqm-autorate to decode binary network data.
endef

define Build/Compile
endef

define Package/lua-vstruct/install
	$(INSTALL_DIR) $(1)/usr/share/lua/vstruct/ast
	$(INSTALL_DIR) $(1)/usr/share/lua/vstruct/io
	$(INSTALL_DATA) $(PKG_BUILD_DIR)/init.lua $(1)/usr/share/lua/vstruct.lua
	$(INSTALL_DATA) $(PKG_BUILD_DIR)/api.lua $(1)/usr/share/lua/vstruct/api.lua
	$(INSTALL_DATA) $(PKG_BUILD_DIR)/ast.lua $(1)/usr/share/lua/vstruct/ast.lua
	$(INSTALL_DATA) $(PKG_BUILD_DIR)/compat1x.lua $(1)/usr/share/lua/vstruct/compat1x.lua
	$(INSTALL_DATA) $(PKG_BUILD_DIR)/cursor.lua $(1)/usr/share/lua/vstruct/cursor.lua
	$(INSTALL_DATA) $(PKG_BUILD_DIR)/frexp.lua $(1)/usr/share/lua/vstruct/frexp.lua
	$(INSTALL_DATA) $(PKG_BUILD_DIR)/io.lua $(1)/usr/share/lua/vstruct/io.lua
	$(INSTALL_DATA) $(PKG_BUILD_DIR)/lexer.lua $(1)/usr/share/lua/vstruct/lexer.lua
	$(CP) $(PKG_BUILD_DIR)/ast/*.lua $(1)/usr/share/lua/vstruct/ast/
	$(CP) $(PKG_BUILD_DIR)/io/*.lua $(1)/usr/share/lua/vstruct/io/
endef

$(eval $(call BuildPackage,lua-vstruct))
