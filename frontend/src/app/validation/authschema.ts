import * as yup from "yup";


export const useRegiserSchema=()=>{
    return yup.object({
        firstName:yup.string()
        .required("Firstname is required"),
        lastName:yup.string()
        .required("Lastname is required"),
        company:yup.string()
        .required("Company is required"),
        email:yup.string()
        .required("Email is required"),
        password:yup.string()
        .required("Password is required")
    })
}

export const useLoginSchema=()=>{
    return yup.object({
        email:yup.string()
        .required("Email is required"),
        password:yup.string()
        .required("Password is required"),
    })
}