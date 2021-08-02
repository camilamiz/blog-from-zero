import Link from 'next/link';

import commonStyles from '../../styles/common.module.scss';

interface ExitPreviewButtonProps {
  preview: boolean;
}

export default function ExitPreviewButton({ preview }: ExitPreviewButtonProps) {
  return(
    <>
      {preview && (
        <aside className={commonStyles.exitPreviewButton}>
          <Link href="/api/exit-preview">
            <a>Sair do modo Preview</a>
          </Link>
        </aside>
      )}
    </>
  );
}
