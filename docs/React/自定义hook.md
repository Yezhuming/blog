# 自定义 hook

## useList

列表查询分页逻辑封装

```js
import { useState, useEffect } from "react";
import { FormInstance } from "antd/lib/form/hooks/useForm";
import useDeepUpdateEffect from "./useDeepUpdateEffect";

interface Result {
  success: boolean;
  data: {
    totalCount: number,
    list: Array<unknown>,
  };
}

interface OptionsProps {
  form?: FormInstance<unknown>;
  defaultPageSize?: number;
  queryParams?: Record<string, unknown>;
}

const useList = (
  request: (params?: unknown) => Promise<Result>,
  { form, defaultPageSize = 10, queryParams }: OptionsProps
): unknown => {
  const [list, setList] = useState < Array < unknown >> [];
  const [pageNum, setPageNum] = useState < number > 1;
  const [pageSize, setPageSize] = useState < number > defaultPageSize;
  const [total, setTotal] = useState < number > 0;
  const [loading, setLoading] = useState < boolean > false;

  const getData = async (params?: unknown) => {
    setLoading(true);
    const { success, data } = await request({
      pageNum,
      pageSize,
      ...queryParams,
      ...params,
    });
    if (success) {
      const { list, totalCount } = data || {};
      setList(list || []);
      setTotal(totalCount || 0);
    }
    setLoading(false);
  };

  const reset = () => {
    if (form) {
      form.resetFields();
      setPageNum(1);
      getData({ pageNum: 1, pageSize });
    }
  };

  useEffect(() => {
    if (form) {
      const formData = form.getFieldsValue();
      getData({ ...formData, pageNum, pageSize });
    } else {
      getData({ pageNum, pageSize });
    }
  }, [pageNum, pageSize]);

  useDeepUpdateEffect(() => {
    reset();
  }, [queryParams]);

  const changePage = (pageNum, pageSize) => {
    setPageNum(pageNum);
    setPageSize(pageSize);
  };

  const submit = () => {
    setPageNum(1);
  };

  const refresh = (_pageNum) => {
    if (_pageNum === pageNum) {
      // 当_pageNum与pageNum相同时无法触发useEffect，需要手动请求数据
      getData({ pageNum, pageSize });
    } else {
      setPageNum(_pageNum ?? pageNum);
    }
  };

  const search = { submit, reset };

  const pagination = { total, pageNum, pageSize, changePage };

  const listProps = { loading, pagination, list };

  return [listProps, search, refresh];
};

export default useList;
```

## useTable

基于 ahook 的 useAntdTable 封装，适用于 antd 的 Table 单独使用或者和 Form 联动

```js
import { FormInstance } from "antd/lib/form/hooks/useForm";
import { useAntdTable, useDeepCompareEffect } from "ahooks";
import { Params as PaginatedParams } from "ahooks/lib/useAntdTable/types";

interface OriginResult {
  success: boolean;
  data: {
    totalCount: number,
    list: Array<unknown>,
  };
}

interface Result {
  total: number;
  list: Array<unknown>;
}

export interface OptionsProps {
  form: FormInstance;
  params?: Record<string, unknown>; // 查询页面需要的额外参数, 动态变化时重置状态重新发起请求
  useRequestOptions?: Record<string, unknown>; // useRequest的配置项
}

const useTable = (
  request: (params?: unknown) => Promise<OriginResult>,
  { form, params, useRequestOptions }: OptionsProps
): unknown => {
  // 自动请求表格数据
  const getTableData = async (
    { current, pageSize, sorter = {} }: PaginatedParams[0],
    formData: Record<string, unknown>
  ): Promise<Result> => {
    if (request) {
      const orderField = sorter.field;
      const order = sorter.order;
      const { data } = await request({
        pageNum: current,
        pageSize,
        orderField: order ? orderField : undefined,
        sort: order ? order === "ascend" : undefined,
        ...formData,
        ...params,
      });
      const { list, totalCount } = data || {};

      return { total: totalCount ?? 0, list: list || [] };
    }
    return { total: 0, list: [] };
  };

  const { tableProps, search, pagination, refresh } = useAntdTable(
    getTableData,
    {
      defaultPageSize: 10,
      form,
      ...useRequestOptions, // 请参考 umiRequest....
    }
  );

  const { changeCurrent } = pagination || {};

  const { reset } = search;

  const del = (deleteCount = 1) => {
    const { totalPage, current } = pagination;
    const { dataSource } = tableProps;
    const shouldChangeCurrent =
      current === totalPage && dataSource?.length <= deleteCount;
    if (shouldChangeCurrent) {
      changeCurrent(Math.max(1, current - 1));
    } else {
      refresh();
    }
  };

  useDeepCompareEffect(() => {
    reset();
  }, [params]);

  return [tableProps, search, refresh, changeCurrent, del];
};

export default useTable;
```
