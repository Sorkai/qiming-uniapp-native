# 分类管理接口文档

## 目录

- [获取分类列表](#获取分类列表)
- [添加或更新分类](#添加或更新分类)
- [删除分类](#删除分类)

## 接口详情

### 获取分类列表

- **接口地址**：`/course/v1/course/category/list`
- **请求方式**：GET
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| pageNum | int64 | 是 | 页码 |
| pageSize | int64 | 否 | 每页数量，默认20 |

- **响应参数**：

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| total | int64 | 总数 |
| categoryList | array | 分类列表 |
| categoryList[].categoryId | int64 | 分类ID |
| categoryList[].name | string | 分类名称 |

### 添加或更新分类

- **接口地址**：`/course/v1/course/category/upsert`
- **请求方式**：POST
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| categoryId | int64 | 否 | 分类ID，不为空时表示修改，默认为0 |
| categoryName | string | 是 | 分类名称 |

- **响应参数**：无

### 删除分类

- **接口地址**：`/course/v1/course/category/delete`
- **请求方式**：POST
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| categoryId | int64 | 是 | 分类ID |

- **响应参数**：无