import { NumberFormatOptions } from 'intl'

/**
 * Helper function to format money into appropriate currency and rounding.
 * If the value is an integer (i.e. no decimal places), do not show `.00`.
 * @param {Number} value the amount
 * @param {String} currency the currency code
 */
export const formatMoney = function (value: bigint, currency: string) {
    let valueAsNumber = Number(value)
    // Create number formatter.
    const options: NumberFormatOptions = {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    }
    // If the value is an integer, show no decimal digits.
    if (valueAsNumber % 1 == 0) {
        options.minimumFractionDigits = 0
    }

    // Some currencies don't need to use higher denominations to represent values.
    if (currency !== 'JPY') {
        valueAsNumber /= 100.0
    }
    const formatter = new Intl.NumberFormat('en-US', options)
    return formatter.format(valueAsNumber)
}

export function validateFormInput<T>(data: Record<string, T>): string[] {
    const missingData: string[] = [];
    
    for (const key in data) {
      if (!data[key]) {
        missingData.push(key);
      }
    }
    
    return missingData;
}

export function isString(value: unknown): value is string {
    return typeof value === 'string';
}
