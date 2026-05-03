/**
 * 文件作用：
 * 初始化第一批种子数据。
 * 当前阶段写入分类、产品和站点内容，供前台首页和产品中心读取。
 */

import { PrismaClient } from "@prisma/client";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  await prisma.inquiryLog.deleteMany();
  await prisma.inquiryItem.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.siteContent.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();

  const categories = await prisma.category.createMany({
    data: [
      {
        name: "工业设备",
        slug: "industrial-equipment",
        description: "工业设备类产品分类",
        sortOrder: 1,
      },
      {
        name: "办公用品",
        slug: "office-supplies",
        description: "办公用品类产品分类",
        sortOrder: 2,
      },
      {
        name: "电子配件",
        slug: "electronic-parts",
        description: "电子配件类产品分类",
        sortOrder: 3,
      },
      {
        name: "包装材料",
        slug: "packaging-materials",
        description: "包装材料类产品分类",
        sortOrder: 4,
      },
      {
        name: "定制产品",
        slug: "custom-products",
        description: "定制产品类产品分类",
        sortOrder: 5,
      },
      {
        name: "企业周边",
        slug: "brand-merchandise",
        description: "企业周边类产品分类",
        sortOrder: 6,
      },
    ],
  });

  const allCategories = await prisma.category.findMany({
    orderBy: {
      sortOrder: "asc",
    },
  });

  const categoryMap = new Map(allCategories.map((item) => [item.slug, item.id]));

  await prisma.product.createMany({
    data: [
      {
        name: "工业设备基础款 A",
        slug: "industrial-basic-a",
        shortDesc: "适用于基础工业场景的设备展示示例。",
        fullDesc: "这里是工业设备基础款 A 的详细介绍内容。",
        keywords: "工业设备,基础款,企业采购",
        priceText: "￥2000 起",
        specsJson: JSON.stringify({
          型号: "A-100",
          规格: "标准版",
          材质: "金属",
          适用场景: "工业环境",
        }),
        isActive: true,
        isFeatured: true,
        featuredSort: 1,
        isManualHot: true,
        manualHotSort: 1,
        salesCount: 120,
        categoryId: categoryMap.get("industrial-equipment")!,
      },
      {
        name: "办公用品组合套装 B",
        slug: "office-set-b",
        shortDesc: "适用于企业办公场景的套装产品示例。",
        fullDesc: "这里是办公用品组合套装 B 的详细介绍内容。",
        keywords: "办公用品,企业采购,办公场景",
        priceText: "￥800 起",
        specsJson: JSON.stringify({
          型号: "B-200",
          规格: "组合装",
          材质: "复合材质",
          适用场景: "办公环境",
        }),
        isActive: true,
        isFeatured: true,
        featuredSort: 2,
        isManualHot: false,
        manualHotSort: 0,
        salesCount: 98,
        categoryId: categoryMap.get("office-supplies")!,
      },
      {
        name: "电子配件标准版 C",
        slug: "electronic-standard-c",
        shortDesc: "适用于配套采购的电子配件产品示例。",
        fullDesc: "这里是电子配件标准版 C 的详细介绍内容。",
        keywords: "电子配件,标准版,企业采购",
        priceText: "面议",
        specsJson: JSON.stringify({
          型号: "C-300",
          规格: "标准版",
          材质: "电子材料",
          适用场景: "设备配套",
        }),
        isActive: true,
        isFeatured: true,
        featuredSort: 3,
        isManualHot: true,
        manualHotSort: 2,
        salesCount: 150,
        categoryId: categoryMap.get("electronic-parts")!,
      },
      {
        name: "包装材料进阶款 D",
        slug: "packaging-advanced-d",
        shortDesc: "适用于企业包装与发货场景的材料产品示例。",
        fullDesc: "这里是包装材料进阶款 D 的详细介绍内容。",
        keywords: "包装材料,发货,企业采购",
        priceText: "￥1200 - ￥1800",
        specsJson: JSON.stringify({
          型号: "D-400",
          规格: "进阶版",
          材质: "包装复合材料",
          适用场景: "物流包装",
        }),
        isActive: true,
        isFeatured: false,
        featuredSort: 0,
        isManualHot: false,
        manualHotSort: 0,
        salesCount: 76,
        categoryId: categoryMap.get("packaging-materials")!,
      },
      {
        name: "定制产品展示款 E",
        slug: "custom-display-e",
        shortDesc: "适用于企业定制展示需求的产品示例。",
        fullDesc: "这里是定制产品展示款 E 的详细介绍内容。",
        keywords: "定制产品,展示,企业方案",
        priceText: "面议",
        specsJson: JSON.stringify({
          型号: "E-500",
          规格: "定制版",
          材质: "按需求定制",
          适用场景: "企业定制",
        }),
        isActive: true,
        isFeatured: true,
        featuredSort: 4,
        isManualHot: false,
        manualHotSort: 0,
        salesCount: 67,
        categoryId: categoryMap.get("custom-products")!,
      },
      {
        name: "企业周边礼品款 F",
        slug: "brand-gift-f",
        shortDesc: "适用于企业周边展示与礼品场景的产品示例。",
        fullDesc: "这里是企业周边礼品款 F 的详细介绍内容。",
        keywords: "企业周边,礼品,品牌展示",
        priceText: "￥600 起",
        specsJson: JSON.stringify({
          型号: "F-600",
          规格: "礼品版",
          材质: "复合材质",
          适用场景: "品牌推广",
        }),
        isActive: true,
        isFeatured: false,
        featuredSort: 0,
        isManualHot: false,
        manualHotSort: 0,
        salesCount: 89,
        categoryId: categoryMap.get("brand-merchandise")!,
      },
    ],
  });

  const allProducts = await prisma.product.findMany();

  for (const product of allProducts) {
    await prisma.productImage.create({
      data: {
        productId: product.id,
        originalUrl: `/demo-images/${product.slug}.png`,
        processedUrl: `/demo-images/${product.slug}-processed.png`,
        isProcessed: true,
        processingStatus: "success",
        logoApplied: true,
        isCover: true,
        sortOrder: 1,
      },
    });
  }

  await prisma.siteContent.createMany({
    data: [
      {
        contentKey: "home_banner",
        title: "简洁、大气、可信赖的企业产品展示与询单平台",
        content:
          "为企业提供统一的产品展示、热销推荐、搜索浏览与询单入口，后续可平滑扩展后台管理与 AI 图片处理能力。",
        imageUrl: "",
        extraJson: JSON.stringify({
          primaryButtonText: "查看产品",
          primaryButtonLink: "/products",
          secondaryButtonText: "热销推荐",
          secondaryButtonLink: "/search",
        }),
      },
      {
        contentKey: "home_company_intro",
        title: "以清晰展示和高效询单为核心的企业产品展示平台",
        content:
          "本平台用于集中展示企业产品信息，帮助客户完成浏览、搜索、筛选和询单。页面风格以简洁、大气、可信赖为核心，兼顾品牌展示与业务转化。",
      },
      {
        contentKey: "home_advantages",
        title: "企业优势",
        content: JSON.stringify([
          {
            title: "专业产品展示",
            description: "突出产品信息层次，便于客户快速建立认知。",
          },
          {
            title: "高效询单流程",
            description: "支持客户快速整理需求，提升沟通效率。",
          },
          {
            title: "品牌统一形象",
            description: "统一页面风格与产品展示逻辑，增强企业可信度。",
          },
          {
            title: "可持续扩展",
            description: "后续可接入数据库、AI 图像处理与后台管理能力。",
          },
        ]),
      },
      {
        contentKey: "inquiry_success_contact",
        title: "询单后联系信息",
        content: "后续订购流程请与工作人员联系。",
        extraJson: JSON.stringify({
          contactName: "公司工作人员",
          phone: "000-00000000",
          wechat: "后续由后台配置",
          email: "contact@example.com",
        }),
      },
    ],
  });

  console.log("✅ Seed 数据写入完成");
  console.log(`✅ 分类写入数量：${categories.count}`);
  console.log(`✅ 产品写入数量：${allProducts.length}`);
}

main()
  .catch((error) => {
    console.error("❌ Seed 失败：", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });