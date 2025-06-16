# 课程管理接口文档

## 目录

- [创建课程](#创建课程)
- [获取课程列表](#获取课程列表)
- [获取课时列表](#获取课时列表)
- [获取课程附件列表](#获取课程附件列表)
- [获取课程详情](#获取课程详情)

## 接口详情

### 创建课程

- **接口地址**：`/course/v1/course/create`
- **请求方式**：POST
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| title | string | 是 | 课程标题 |
| thumb | int64 | 是 | 课程封面资源ID |
| shortDesc | string | 是 | 课程简介 |
| isRequired | int64 | 是 | 是否必修，1: 必修，0: 选修 |
| categoryIds | array | 是 | 课程分类ID列表 |
| isChapter | int64 | 是 | 是否章节，1: 是，0: 否 |
| endingTime | string | 是 | 课程结束时间（ISO8601） |
| chapterList | array | 否 | 章节列表 |
| chapterList[].chapterId | int64 | 否 | 章节ID |
| chapterList[].name | string | 是 | 章节标题 |
| chapterList[].hourList | array | 是 | 章节课时 |
| hourList | array | 否 | 课时列表 |
| hourList[].resourceId | int64 | 是 | 课时资源ID |
| hourList[].duration | int64 | 是 | 时长（秒） |
| hourList[].title | string | 否 | 课时标题 |
| hourList[].rType | string | 否 | 资源类型 |
| hourList[].hourId | int64 | 否 | 课时ID |
| hourList[].fileUrl | string | 否 | 课时文件地址 |
| attrList | array | 否 | 附件资源列表 |
| attrList[].resourceId | int64 | 是 | 附件资源ID |
| attrList[].title | string | 否 | 附件标题 |
| attrList[].rType | string | 否 | 附件类型 |
| attrList[].attrId | int64 | 否 | 附件ID |
| attrList[].fileUrl | string | 否 | 附件地址 |

- **响应参数**：无

### 获取课程列表

- **接口地址**：`/course/v1/course/list`
- **请求方式**：GET
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| pageNum | int64 | 是 | 页码 |
| pageSize | int64 | 否 | 每页数量，默认20 |
| courseName | string | 否 | 课程名称 |

- **响应参数**：

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| total | int64 | 总数 |
| courseList | array | 课程列表 |
| courseList[].courseId | int64 | 课程ID |
| courseList[].title | string | 课程标题 |
| courseList[].thumbUrl | string | 课程封面URL |
| courseList[].shortDesc | string | 课程简介 |
| courseList[].categoryDesc | string | 分类描述 |
| courseList[].isRequired | int64 | 是否必修，1: 必修，0: 选修 |
| courseList[].userName | string | 用户名 |
| courseList[].startTime | string | 开始时间 |
| courseList[].endTime | string | 结束时间 |
| courseList[].categoryList | array | 分类列表 |
| courseList[].categoryList[].categoryId | int64 | 分类ID |
| courseList[].categoryList[].name | string | 分类名称 |

### 获取课时列表

- **接口地址**：`/course/v1/course/hours/list`
- **请求方式**：GET
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| courseId | int64 | 是 | 课程ID |

- **响应参数**：

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| courseChapters | array | 课程章节列表 |
| courseChapters[].chapterId | int64 | 章节ID |
| courseChapters[].name | string | 章节标题 |
| courseChapters[].hourList | array | 章节课时列表 |
| courseChapters[].hourList[].resourceId | int64 | 课时资源ID |
| courseChapters[].hourList[].duration | int64 | 时长（秒） |
| courseChapters[].hourList[].title | string | 课时标题 |
| courseChapters[].hourList[].rType | string | 资源类型 |
| courseChapters[].hourList[].hourId | int64 | 课时ID |
| courseChapters[].hourList[].fileUrl | string | 课时文件地址 |

### 获取课程附件列表

- **接口地址**：`/course/v1/course/attr/list`
- **请求方式**：GET
- **请求参数**：

| 参数名 | 类型 | 必填 | 描述 |
| ------ | ---- | ---- | ---- |
| courseId | int64 | 是 | 课程ID |

- **响应参数**：

| 参数名 | 类型 | 描述 |
| ------ | ---- | ---- |
| courseWares | array | 课程附件列表 |
| courseWares[].resourceId | int64 | 附件资源ID |
| courseWares[].title | string | 附件标题 |
| courseWares[].rType | string | 附件类型 |
| courseWares[].attrId | int64 | 附件ID |
| courseWares[].fileUrl | string | 附件地址 |

### 获取课程详情

- **接口地址**：`/course/v1/course/detail`
- **请求方式**：GET
- **请求参数**：无
- **响应参数**：无

> 注：课程详情接口在API定义中未提供详细的请求和响应参数结构。