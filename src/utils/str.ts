/**
 * 숫자를 3자리 유효 숫자로 제한하여 축약된 문자열로 변환합니다.
 * 단위: K(10^3), M(10^6), G(10^9), T(10^12), P(10^15 이상)
 */
export function formatCompactNumber(num: number): string {
  if (num === 0) return '0';
  if (isNaN(num)) return '0';

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  // 단위 정의
  const units = ['', 'K', 'M', 'G', 'T', 'P'];
  
  // 단위 지수 계산 (1000 단위)
  let unitIndex = Math.floor(Math.log10(absNum) / 3);
  
  // P(경) 단위를 초과하는 경우 P로 고정
  if (unitIndex >= units.length) {
    unitIndex = units.length - 1;
  }
  
  // 1000보다 작은 경우 그대로 반환
  if (unitIndex <= 0) {
    return sign + absNum.toString();
  }

  // 해당 단위로 나눈 값
  const scaled = absNum / Math.pow(1000, unitIndex);
  
  // P 단위이고 1000 이상인 경우 (3자리 제한 예외 적용 요청)
  if (unitIndex === units.length - 1 && scaled >= 1000) {
    return sign + Math.round(scaled).toString() + units[unitIndex];
  }

  // 3자리 유효 숫자로 변환 후 불필요한 소수점 제거
  // parseFloat()를 사용하면 '1.00' -> '1', '1.20' -> '1.2'와 같이 정리됨
  const result = parseFloat(scaled.toPrecision(3)).toString();
  
  return sign + result + units[unitIndex];
}

/**
 * 파일 크기를 3자리 유효 숫자로 제한하여 축약된 문자열로 변환합니다. (1024 기준)
 * 단위: B, KB, MB, GB, TB, PB
 */
export function formatCompactFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (isNaN(bytes)) return '0 B';

  const k = 1024;
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const absBytes = Math.abs(bytes);
  const sign = bytes < 0 ? '-' : '';

  let i = Math.floor(Math.log(absBytes) / Math.log(k));
  
  // PB 단위를 초과하는 경우 PB로 고정
  if (i >= units.length) {
    i = units.length - 1;
  }

  // 1024보다 작은 경우 (B 단위)
  if (i <= 0) {
    return sign + absBytes.toString() + ' ' + units[0];
  }

  const scaled = absBytes / Math.pow(k, i);
  
  // 3자리 유효 숫자로 변환 후 불필요한 소수점 제거
  const result = parseFloat(scaled.toPrecision(3)).toString();
  
  return sign + result + ' ' + units[i];
}
