import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 先创建
  await Promise.all(
    [
      { email: '张三@mail.com', name: '张三' },
      { email: '李四@mail.com', name: '李四' },
      { email: '王二麻子@mail.com', name: '王二麻子' },
    ].map(async (user) =>
      prisma.user.create({
        data: user,
      })
    )
  );

  // 读取
  console.log('新增三个用户：', await prisma.user.findMany());

  // 更新
  await prisma.user.update({
    where: {
      email: '李四@mail.com',
    },
    data: {
      name: '修改李四的名字为徐六',
    },
  });

  // 删除 王二麻子
  await prisma.user.delete({
    where: {
      email: '王二麻子@mail.com',
    },
  });

  //
  console.log('删除 王二麻子之后的数据：', await prisma.user.findMany());
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
