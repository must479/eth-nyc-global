import requests
import fire
import pandas as pd
import datetime

API_KEY = "ckey_1f70df9e2a0c4f349ee639fd714"
PAIRS_POOL = {
    "DAI_USDC": "0xae461ca67b15dc8dc81ce7615e0320da1a9ab8d5",
    "USDC_WETH": "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc",
    "WETH_USDT": "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852",
    "DAI_WETH": "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11",
    "USDC_USDT": "0x3041cbd36888becc7bbcbc0045e3b1f144466f5f"
}
log_data = 0


LOG_HASH_DAI_USDC = "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822"

LOG_HASH_DAI_WETH = "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822"


def block_height(num_days=7):
    base = datetime.datetime.today() + datetime.timedelta(days=1)

    clean_data = {}
    for i in range(0, num_days+1):
        yes = base - datetime.timedelta(days=1)

        base_fm = base.strftime("%Y-%m-%d")
        yes_fm = yes.strftime("%Y-%m-%d")
        url = "https://api.covalenthq.com/v1/1/block_v2/" + yes_fm + \
            "/" + base_fm + "/?quote-currency=USD&format=JSON&key="+API_KEY
        response = requests.get(url)
        data = response.json()
        block_list = []
        for item in data["data"]["items"]:
            block_list.append(item["height"])
        clean_data[i] = {'start': base_fm,
                         'end': yes_fm, 'min_block': min(block_list), 'max_block': max(block_list)}

        base = yes

    return clean_data


def get_txs(selected_pool="DAI_USDC", num_days=7, log_data=LOG_HASH_DAI_USDC):
    block_data = block_height(num_days)
    tx_data = {}
    for item in block_data:

        val = block_data[item]
        url = "https://api.covalenthq.com/v1/1/events/topics/" + log_data + "/?quote-currency=USD&format=JSON&starting-block=" + \
            str(val["min_block"]) + "&ending-block=" + str(val["max_block"]) + \
            "&sender-address=" + PAIRS_POOL[selected_pool] + "&key=" + API_KEY
        response = requests.get(url)
        data = response.json()
        if len(data["data"]["items"]) != 0:
            for item in data["data"]["items"]:
                tx_data[item["tx_hash"]] = {'block_signed_at': item["block_signed_at"], 'start': val["start"],
                                            'end': val["end"]}

    return tx_data


def get_gas(selected_pool="DAI_USDC", num_days=7, log_data=LOG_HASH_DAI_USDC):
    tx_data = get_txs(selected_pool, num_days, log_data)
    day_data = {}
    for item in tx_data:
        url = "https://api.covalenthq.com/v1/1/transaction_v2/" + item + \
            "/?quote-currency=USD&format=JSON&no-logs=false&key="+API_KEY
        response = requests.get(url)
        data = response.json()

        date = data["data"]["items"][0]["block_signed_at"]
        date_fm = datetime.datetime.strptime(date, "%Y-%m-%dT%H:%M:%SZ")
        date_fm = date_fm.strftime("%Y-%m-%d")
        gas_price = data["data"]["items"][0]["gas_price"]
        gas_spent = data["data"]["items"][0]["gas_spent"]
        gas_price = gas_spent * gas_price
        if date_fm in day_data:
            gas = day_data[date_fm]["amount"] + gas_price
            count = day_data[date_fm]["count"] + 1
            day_data[date_fm] = {
                "amount": gas,
                "count": count + 1
            }
        else:
            day_data[date_fm] = {
                "amount": gas_price,
                "count": 1
            }
    # print(day_data)
    return day_data


def get_data(field="price_timeseries_7d", selected_pool="DAI_WETH"):
    """
    Get data from url
    """

    if selected_pool == "DAI_WETH":
        log_data = LOG_HASH_DAI_WETH
    elif selected_pool == "DAI_USDC":
        log_data = LOG_HASH_DAI_USDC

    url = "https://api.covalenthq.com/v1/1/xy=k/uniswap_v2/pools/address/" + \
        PAIRS_POOL[selected_pool] + \
        "/?quote-currency=USD&format=JSON&key="+API_KEY
    response = requests.get(url)
    data = response.json()

    items = data["data"]["items"][0][field]

    list_aquiared = {}
    list_dates = []

    def date_form(date):

        date_fm = datetime.datetime.strptime(date, "%Y-%m-%dT%H:%M:%SZ")
        date_fm = date_fm.strftime("%Y-%m-%d")
        return date_fm

    if field == "price_timeseries_7d":
        num_days = 7
    elif field == "price_timeseries_30d":
        num_days = 30

    if field == "price_timeseries_30d" or field == "price_timeseries_7d":
        for item in items:
            list_aquiared[date_form(item["dt"])] = {"token_0": item["price_of_token0_in_quote_currency"],
                                                    "token_1": item["price_of_token1_in_quote_currency"],
                                                    "gas": None}
    if field == "volume_timeseries_30d" or field == "volume_timeseries_7d":
        for item in items:
            list_aquiared[date_form(item["dt"])] = {"token_0": item["token0_quote_rate"],
                                                    "token_1": item["token1_quote_rate"],
                                                    "gas": None}
    if field == "liquidity_timeseries_30d" or field == "liquidity_timeseries_7d":
        for item in items:
            list_aquiared[date_form(item["dt"])] = {"token_0": item["token0_quote_rate"],
                                                    "token_1": item["token1_quote_rate"],
                                                    "gas": None}

    gas_data = get_gas(selected_pool, num_days=num_days, log_data=log_data)

    for item in gas_data:
        if item in list_aquiared:

            list_aquiared[item] = {"token_0": list_aquiared[item]["token_0"],
                                   "token_1": list_aquiared[item]["token_1"],
                                   "gas": gas_data[item]["amount"]/gas_data[item]["count"]}
    # print("2", list_aquiared)
    list_format = []
    for item in list_aquiared:
        gas = None
        end_price = None
        if list_aquiared[item]["gas"]:
            gas = list_aquiared[item]["gas"]/1000000000
            if list_aquiared[item]["token_1"]:
                end_price = gas*list_aquiared[item]["token_1"]/1000000000
        list_format.append(
            [item, list_aquiared[item]["token_0"], list_aquiared[item]["token_1"], gas, end_price])

    df = pd.DataFrame(list_format, columns=[
                      'date', 'token_0', 'token_1', 'total_gas', "swap_price"])
    df.to_csv(field + "_" + selected_pool + '.csv')


def pool_address_get():
    response = requests.get(
        "https://api.covalenthq.com/v1/xy=k/supported_dexes/?quote-currency=USD&format=JSON&key=ckey_1f70df9e2a0c4f349ee639fd714")
    data = response.json()
    # breakpoint()
    pool_add = {}
    items = data["data"]["items"]
    for item in items:
        pool_add[item["dex_name"]] = item["router_contract_addresses"][0]
    # print(pool_add)


# type main function
if __name__ == '__main__':
    fire.Fire()
