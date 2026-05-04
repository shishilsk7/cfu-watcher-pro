import pandas as pd
df = pd.read_csv(r"C:\Users\malus\myfolder\data\WBE_large_dataset.csv")
print(df[df["Sample"]=="AIML"].tail(7).to_string(index=False))
