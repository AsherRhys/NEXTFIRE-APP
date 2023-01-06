import styles from "../styles/Home.module.css";

interface LoaderProps {

    show: boolean;
}

export default function Loader(props: LoaderProps) {
    return /* props.show */ true ? <div className="loader"></div> : null;
}
