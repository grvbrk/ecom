declare type Product = {
  id: number;
  name: string;
  priceincents: number;
  filepath: string;
  imagepath: string;
  description: string;
  isavailableforpurchase: boolean;
  created_at: Date;
  updated_at: Date;
};
declare type User = {
  id: number;
  email: string;
  created_at: Date;
  updated_at: Date;
};
declare type Order = {
  id: number;
  priceincents: number;
  userid: number;
  productid: number;
  created_at: Date;
  updated_at: Date;
};
declare type DownloadVerification = {
  id: number;
  expiresat: Date;
  productid: number;
  created_at: Date;
  updated_at: Date;
};
