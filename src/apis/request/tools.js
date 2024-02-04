/**
 * @typedef {object} BaseQueryParams
 * @property {string} keyword
 * @property {number} page
 * @property {number} size
 * @property {'asc'|'desc'} sort
 */

/**
 * @template T
 * @typedef {[Error|null, T, T] & {error: Error|null, data: T, origin: T}} ErrorFirstStyleData
 */

/**
 * @template T
 * @typedef {Object} CustomResponseData
 * @property {number} code
 * @property {T|null|undefined} data
 * @property {string|null|undefined} msg
 */

/**
 * @template T
 * @typedef {ErrorFirstStyleData<CustomResponseData<T>>} ErrorFirstStyleResponse
 */

/**
 * @typedef {object} UserIntercetorsConfigRequest
 * @property {boolean?} enable
 * @property {boolean?} validToken
 * @typedef {object} UserIntercetorsConfigResponse
 * @property {boolean?} enable
 * @property {boolean?} autoDeconstructionData
 * @property {boolean?} useErrorFirstStyle
 * @typedef {object} UserIntercetorsConfig
 * @property {UserIntercetorsConfigRequest?} request
 * @property {UserIntercetorsConfigResponse?} response
 * @param {UserIntercetorsConfig?} config
 * @returns
 */
export const useUserIntercetorsConfig = (config = { request: {}, response: {} }) => {
  const userIntercetorsConfig = {};
  if (config.request) {
    userIntercetorsConfig.request = config.request;
    userIntercetorsConfig.request.enable = Boolean(userIntercetorsConfig.request.enable);
    userIntercetorsConfig.request.validToken = Boolean(userIntercetorsConfig.request.validToken);
  }
  if (config.response) {
    userIntercetorsConfig.response = config.response;
    userIntercetorsConfig.response.enable = Boolean(userIntercetorsConfig.response.enable);
    userIntercetorsConfig.response.autoDeconstructionData = Boolean(
      userIntercetorsConfig.response.autoDeconstructionData
    );
    userIntercetorsConfig.response.useErrorFirstStyle = Boolean(userIntercetorsConfig.response.useErrorFirstStyle);
  }
  return userIntercetorsConfig;
};

/**
 * @param {import('axios').AxiosResponse} response
 * @param {string} propsPath
 * @returns
 */
export const useDestructuringFilename = (response, propsPath) => {
  return propsPath.split('.').reduce((p, c) => p[c], response) || '';
};

/**
 * @param {import('axios').AxiosResponse<Blob>} response
 * @param {string} optionalFileName
 */
export const useHandleResponseBlob = (response, optionalFileName) => {
  let data = {
    code: -1,
    data: null,
    msg: '',
  };
  if (response.data && Object.prototype.toString.call(response.data) === '[object Blob]') {
    data.code = response.data.code || response.status;
    data.data = response.data;
    data.msg =
      useDestructuringFilename(response, 'headers.filename') ||
      useDestructuringFilename(response, 'headers.content-disposition') ||
      useDestructuringFilename(response, 'data.msg') ||
      String(optionalFileName);
  }
  return data;
};

export const errorHandler = {
  authErrorMap: new Map([
    [10001, '认证过期，请重新登录'],
    [10002, '未知角色或权限，请联系管理员'],
    [10003, '未知用户，请注册'],
    [10004, '账户已停用'],
    [10005, '链接第三方通信失败，请联系管理员'],
  ]),
  networkErrorMap: new Map([
    [400, '请求数据有误'],
    [401, '未授权，请重新认证'],
    [403, '未授权，拒绝访问'],
    [404, '请求错误，未找到该资源'],
    [405, '请求方式不合法'],
    [406, '无法解析响应'],
    [407, '代理或网关需认证'],
    [408, '请求超时'],
    [500, '服务器错误'],
    [501, '服务器不支持'],
    [502, '代理或网关错误'],
    [503, '服务繁忙不可用'],
    [504, '代理或网关超时'],
    [505, 'HTTP版本不支持'],
  ]),
  /**
   * @param {T} origin
   * @param {boolean} isError
   * @returns {ErrorFirstStyleData<T>}
   */
  wrapDataToErrorFirstStyle(origin, isError = false) {
    if (origin && origin.length === 3 && Object.keys(origin).join(',') === '0,1,2,error,data,origin') {
      return origin;
    }
    let error = null,
      data = null;
    if (origin instanceof Error || isError) {
      error = new Error(origin.msg || origin.message || origin);
    } else {
      data = origin;
    }
    let resData = [error, data, origin];
    resData.error = error;
    resData.data = data;
    resData.origin = origin;
    return resData;
  },
  /**
   * @param {import('axios').AxiosResponse} response
   * @param {string} propsPath
   * @param {'Auth'|'Network'} errorType
   * @returns {Error}
   */
  generateError(response, propsPath, errorType) {
    let error = new Error();
    /**
     * @type {number}
     */
    let code = propsPath.split('.').reduce((p, c) => p[c], response) || response.status;
    error.name = `${errorType} ${code} Error`;
    if (errorType === 'Auth') {
      error.message = this.authErrorMap.get(code);
    }
    if (errorType === 'Network') {
      error.message = this.networkErrorMap.get(code);
    }
    return error;
  },
  /**
   * @param {import('axios').AxiosResponse} response
   * @param {Function|undefined} callback
   * @param {string|undefined} propsPath
   * @param {string|undefined} optionalErrorMsg
   * @returns
   */
  auth(response, callback, propsPath = 'data.code', optionalErrorMsg = '错误的请求，请重新登录') {
    let error = this.generateError(response, propsPath, 'Auth');
    error.message = error.message || optionalErrorMsg;
    return typeof callback === 'function' ? callback(error) : error;
  },
  /**
   * @param {import('axios').AxiosResponse} response
   * @param {Function|undefined} callback
   * @param {string|undefined} propsPath
   * @param {string|undefined} optionalErrorMsg
   * @returns
   */
  network(response, callback, propsPath = 'status', optionalErrorMsg = '无法连接到服务器，请确认网络情况') {
    let error = this.generateError(response, propsPath, 'Network');
    error.message = error.message || optionalErrorMsg;
    return typeof callback === 'function' ? callback(error) : error;
  },
};
