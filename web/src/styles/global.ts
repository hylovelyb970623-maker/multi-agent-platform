// 全局样式
export const globalStyles = `
  * { box-sizing: border-box; }
  html, body, #root {
    margin: 0;
    padding: 0;
    height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
      'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
    background: #F7F8FA;
    color: #1F2937;
  }
  /* 自定义滚动条 */
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }
  ::-webkit-scrollbar-track { background: transparent; }

  /* 品牌实色(墨绿,原 .ds-gradient 渐变已弃用,保留 class 名以兼容旧引用) */
  .ds-gradient {
    background: #0F766E;
  }
  /* 渐变文字改为纯主色 */
  .ds-gradient-text {
    color: #0F766E;
  }

  /* 卡片悬浮效果(阴影改中性灰,不再带紫色色相) */
  .ds-card-hover {
    transition: all 0.25s ease;
  }
  .ds-card-hover:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(31, 41, 55, 0.10);
  }
`;
