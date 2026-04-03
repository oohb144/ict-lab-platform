import Sidebar from '../../components/blog/Sidebar';

export default function BlogAbout() {
  return (
    <div className="flex gap-8">
      <div className="flex-1 min-w-0">
        <article className="bg-white rounded-lg border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-50">关于我</h1>
          <div className="prose prose-sm max-w-none text-gray-600 space-y-4">
            <p>你好！这里是 ICT 实验室的个人博客空间。</p>
            <p>
              这里记录着技术学习笔记、项目开发经验、以及一些生活随笔。
              内容主要涵盖：
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>人工智能与深度学习</li>
              <li>物联网与边缘计算</li>
              <li>大数据分析</li>
              <li>网络与信息安全</li>
              <li>Web 开发技术</li>
            </ul>
            <p className="text-gray-400 text-sm mt-6">
              如有问题或建议，欢迎通过实验室平台联系。
            </p>
          </div>
        </article>
      </div>

      <div className="w-64 shrink-0 hidden lg:block">
        <Sidebar />
      </div>
    </div>
  );
}
