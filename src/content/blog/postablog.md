---
title: "如何在自己的个人网站上发布一篇博客"
description: "方法论-关于如何在发布一篇博客到自己的个人网站。"
pubDate: 2026-04-16
---

#具体怎么做？ — 4 步                         
                                                                                                                                  
  ① 写在哪？
                                                                                                                                                            
  在这个路径下新建一个 .md 文件：                                                                                                                           
                                                                                                                                                            
  /Users/roxiez/AI/projects/my-site/src/content/blog/                                                                                                       
                                                                                                                                                            
  打开这个目录你会看到：                                                                                                                                    
  hello-world.md        ← 最早那篇示例                                                                                                                      
  first-real-post.md    ← 我刚帮你建的                                                                                                                      
  _template.md          ← 下划线开头，不会发布，专门给你当模板
                                                                                                                                                            
  ② 新建一个文件                                                                                                                                            
                                                                                                                                                            
  文件名 = 你文章的 URL，比如你想写「GEO 是什么」：                                                                                                         
  - 新建文件：geo-what-is-it.md                             
  - 发布后 URL 自动是 /blog/geo-what-is-it                                                                                                                  
                                                            
  命名规则：英文小写 + 短横线连字符。别用中文、空格、下划线开头（下划线开头会被当草稿忽略）。                                                               
                                                                                                                                                            
  ③ 内容怎么填？                                                                                                                                            
                                                                                                                                                            
  拷贝一份刚建的 _template.md：                                                                                                                             
   
  cp src/content/blog/_template.md src/content/blog/geo-what-is-it.md                                                                                       
                                                            
  （或者你在 IDE 里右键复制粘贴重命名都行）                                                                                                                 
   
  然后打开新文件，填三个地方：                                                                                                                              
                                                            
  A. 顶部 frontmatter（三横线包住的三行，必须有）                                                                                                           
  ---                                                       
  title: "GEO 是什么，和 SEO 有什么区别"     ← 改成你文章标题                                                                                               
  description: "一句话摘要，会显示在博客列表。"  ← 改成你的摘要
  pubDate: 2026-04-21                        ← 今天日期                                                                                                     
  ---                                                                                                                                                       
                                                                                                                                                            
  B. 三横线下面写正文，就是普通 Markdown：                                                                                                                  
  ## 第一个小节                                                                                                                                             
               
  直接打字。要分段就空一行。                                                                                                                                
                                                                                                                                                            
  ## 第二个小节
                                                                                                                                                            
  - 列表                                                    
  - 也可以                                                                                                                                                  
          
  C. 要插图的话：                                                                                                                                           
  - 图片丢进 /Users/roxiez/AI/projects/my-site/public/blog/ 目录                                                                                            
  - 正文里写 ![描述](/blog/图片文件名.png)                      
                                                                                                                                                            
  ④ 保存就完了                                                                                                                                             
                                                                                                                                                            
  Dev server 看到文件变化会自动重新生成。刷新浏览器                                                                                                                                                           
  ---                                                                                                                                                       
  
  
  
  最简的写法（真的就这 5 行）                               
                                                                                                                                                            
  如果你嫌模板里东西多，最简版本：
                                                                                                                                                            
  ---                                                       
  title: "今天学了一个好玩的东西"                                                                                                                           
  description: "刚发现 Claude Code 的 skill 系统很有意思。"                                                                                                 
  pubDate: 2026-04-21                                                                                                                                       
  ---                                                                                                                                                       
                                                                                                                                                            
  今天玩了一下 Claude Code 的自定义 skill，挺好用。                                                                                                         
                                                            
  下次找个正经时间写个完整教程。                                                                                                                            
                                                            
  三横线里三个字段 + 下面随便写字。就这样，没有别的要求。                                                                                                   
                                                            
  ---                         

