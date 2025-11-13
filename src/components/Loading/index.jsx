import { useSelector } from "react-redux";

function Loading()
{
    const {isLoading} = useSelector(state=>state.loading);
    return (
        <div className={`fixed flex items-center justify-center bg-black opacity-50 w-full h-full top-0  ${isLoading ? 'visible' : 'invisible' }`} style={{zIndex:2000}}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-orange mr-2!"></div>
        </div>
    )
}
export default Loading;