# 后端分类管理接口

## 获取课程分类列表

- **接口地址**：`/edu/backend/v1/course/category/list`
- **请求方式**：GET
- **请求参数**：

```
pageNum: int64    // 页码
pageSize: int64   // 每页数量，默认20
```

- **响应参数**：

```json
{
  "total": "int64",      // 总数
  "categoryList": [      // 分类列表
    {
      "categoryId": "int64", // 分类ID
      "name": "string"       // 分类名称
    }
  ]
}
```

## 新增或修改课程分类

- **接口地址**：`/edu/backend/v1/course/category/upsert`
- **请求方式**：POST
- **请求参数**：

```json
{
  "categoryId": "int64",     // 分类ID不为空时，修改，默认为0
  "categoryName": "string"  // 分类名称
}
```

- **响应参数**：无

## 删除课程分类

- **接口地址**：`/edu/backend/v1/course/category/delete`
- **请求方式**：POST
- **请求参数**：

```json
{
  "categoryId": "int64"  // 分类ID
}
```

- **响应参数**：无