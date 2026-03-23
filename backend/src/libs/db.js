import mongoose from 'mongoose'

//kết nối cơ sở dữ liệu
export const connectDB = async () =>{
    try{
        await mongoose.connect(process.env.MONGOOSE_CONNECTIONSTRING);
        console.log("Kết nối database thành công")
    }
    catch(error){
        console.log("Kết nối database thất bại: ", error);
        process.exit(1);
        //dừng chương trình nếu không kết nối được db    
    }
}