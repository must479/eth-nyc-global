import requests
import fire

MAINPOINT = "https://api.covalenthq.com/v1/"
CHAIN = "1"  # Mainnet
API_KEY = "ckey_1f70df9e2a0c4f349ee639fd714"
base_url = MAINPOINT + CHAIN + API_KEY
DAI_USDC = "0xae461ca67b15dc8dc81ce7615e0320da1a9ab8d5"
USDC_WETH = "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc"
WETH_USDT = "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852"
DAI_WETH = "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11"
USDC_USDT = "0x3041cbd36888becc7bbcbc0045e3b1f144466f5f"


def get_data():
    """
    Get data from url
    """
    response = requests.get(
        "https://api.covalenthq.com/v1/1/xy=k/uniswap_v2/pools/address/0xbeaa8068e529951f9f5dea313b9ac4e5b83e8fd7/?quote-currency=USD&format=JSON&key=ckey_1f70df9e2a0c4f349ee639fd714")
    print(response.json())


def pool_address_get():
    response = requests.get(
        "https://api.covalenthq.com/v1/xy=k/supported_dexes/?quote-currency=USD&format=JSON&key=ckey_1f70df9e2a0c4f349ee639fd714")
    data = response.json()
    # breakpoint()
    pool_add = {}
    items = data["data"]["items"]
    for item in items:
        pool_add[item["dex_name"]] = item["router_contract_addresses"][0]
    print(pool_add)


# type main function
if __name__ == '__main__':
    fire.Fire()
