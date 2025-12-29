export const SITE = {
  website: "https://cool19980208.github.io/",
  author: "Cool",
  profile: "https://github.com/cool19980208",
  desc: "Cool 的技术博客 - 分享 Java、.NET、学习方法和程序员软技能",
  title: "Cool's Blog",
  ogImage: "astropaper-og.png",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 10,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: false, // 关闭编辑按钮
    text: "Edit page",
    url: "https://github.com/cool19980208/blog-v2/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr", // "rtl" | "auto"
  lang: "zh-CN", // 改为中文
  timezone: "Asia/Shanghai", // 改为上海时区
} as const;
