# 这个项目已停止开发，请前往 [Alive](https://github.com/TopSea/Alive) 。

## 一些碎碎念
### 学 react 到现在差不多一个月了。这个项目花了不到十天就完成了，当然也还有很多不够完善的地方。但是我越做越觉得不对劲，基本上是不能用 hook ，每次 hook 执行的时候模型都会刷新一次并且造成非常严重的内存泄漏，一开始我做的是一个滑条来控制大小和位置，结果滑一下内存干掉了 12G ，吓我一跳。赶紧搜了一下，似乎是和 react 的渲染策略有关：react 的 state 更新必要的话会重新渲染 dom ，但是 pixi.js 的 canvas 自己就会刷新这样模型才会动。然后更新了 state 这俩就开始打架然后就内存炸了。找了找是有办法阻止 pixi.js 的被动更新，然后自己刷新 pixi.js ，看着挺麻烦，更何况让我这个菜鸟来做。所以果断放弃，不能用 hook，那不用就不用。又折腾了 3、4 天就做成了现在这个四不像。做是做出来了，但是槽点太多我自己都不乐意用。而且此时我脑子里又有了新的想法：做 mmd 的桌宠！赶紧又搜了一下：three.js 有 mmdloader，而且支持导入动作文件！那么理论上是可以做的，有个小问题就是 three.js 也是自己刷新的。那咋办，不能用 hook 还用什么 react。所以今天已经是我学习 vue 的第二天了。现在的想法是做一个支持 live2d 和 mmd 模型的桌宠，暂且取名为 Alive。因为做现在这个项目已经踩了不少坑，我估计 3、5 天，最多一星期就能把 live2d 的部分做出来（正好现在没班上，好好折腾折腾）。mmd 的部分就是新坑了，可能要不少时间，不知道过年前能不能搞出来。好了，说的也差不多了。VSCode，启动！

