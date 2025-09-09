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
        .required("Email is required")
            .email("Invalid email address")
            .matches(
                /^[^\s@]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                "Invalid email format"
            ),
        password:yup.string()
        .required("Password is required")
    })
}

export const useLoginSchema=()=>{
    return yup.object({
      email:yup.string()
        .required("Email is required")
            .email("Invalid email address")
            .matches(
                /^[^\s@]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                "Invalid email format"
            ),
        password:yup.string()
        .required("Password is required"),
    })
}