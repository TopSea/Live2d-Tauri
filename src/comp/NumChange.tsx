import { FC, MouseEventHandler } from 'react';
import { HiOutlineMinus, HiOutlinePlus } from "react-icons/hi2";

interface NumOps {
    visGroup: string;
    onPlus: MouseEventHandler<HTMLButtonElement>;
    onMinus: MouseEventHandler<HTMLButtonElement>;
    storeValue: () => void;
    styles: {top: number, left: number};
}


const NumChange: FC<NumOps> = ({ 
    visGroup,
    onPlus,
    onMinus,
    storeValue,
    styles,
}) => {
    var pressed = false;
    
    return (
        <div className={"invisible absolute flex h-8 items-center rotate-90 space-x-2 " + visGroup} style={styles}>
            <button onClick={onPlus}
             className="w-7 h-7 rounded-md bg-slate-700 hover:rounded-2xl"
             onMouseDown={ () => { pressed = true; } }
             onMouseMove={ (e) => { if (pressed) onPlus(e); } }
             onMouseLeave={ () => { pressed = false; } }
             onMouseUp={ () => { pressed = false; storeValue() } }
             >
                <HiOutlinePlus className="w-7 h-7 text-slate-100" />
            </button>
            <button onClick={onMinus}
             className="w-7 h-7 rounded-md bg-slate-700 hover:rounded-2xl"
             onMouseDown={ () => { pressed = true; } }
             onMouseMove={ (e) => { if (pressed) onMinus(e); } }
             onMouseLeave={ () => { pressed = false; } }
             onMouseUp={ () => { pressed = false; storeValue() } }
             >
                <HiOutlineMinus className="w-7 h-7 text-slate-100 rotate-90" />
            </button>
        </div>
    );
}

export default NumChange;