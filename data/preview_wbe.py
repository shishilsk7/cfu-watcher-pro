import sys
import traceback

try:
    import pandas as pd
except Exception as e:
    print("ERROR: pandas is not available. Install with: pip install pandas")
    print("Detailed error:", e)
    sys.exit(2)

path = r"C:\Users\malus\myfolder\data\WBE_large_dataset.csv"

try:
    df = pd.read_csv(path, low_memory=False)
except Exception as e:
    print("ERROR reading CSV:")
    traceback.print_exc()
    sys.exit(1)

print("File:", path)
print("Shape:", df.shape)
print("Columns:", list(df.columns))
print("\nFirst 20 rows:")
print(df.head(20).to_string(index=False))
print("\nDtypes:")
print(df.dtypes)
print("\nSummary (non-null counts):")
print(df.info(buf=None))
